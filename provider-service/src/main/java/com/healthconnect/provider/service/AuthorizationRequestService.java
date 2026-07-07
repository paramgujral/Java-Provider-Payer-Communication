package com.healthconnect.provider.service;

import com.healthconnect.common.fhir.PriorAuthFhirMapper;
import com.healthconnect.common.model.AuthorizationStatus;
import com.healthconnect.common.model.DecisionData;
import com.healthconnect.provider.copilot.CopilotReport;
import com.healthconnect.provider.copilot.CopilotService;
import com.healthconnect.provider.domain.AuthorizationRequest;
import com.healthconnect.provider.domain.Notification;
import com.healthconnect.provider.domain.StatusHistory;
import com.healthconnect.provider.repository.AuthorizationRequestRepository;
import com.healthconnect.provider.repository.NotificationRepository;
import com.healthconnect.provider.repository.StatusHistoryRepository;
import com.healthconnect.provider.web.dto.AuthorizationRequestDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.Year;
import java.util.List;

/** Provider-side workflow: drafts, submission to the payer, and payer decisions. */
@Service
public class AuthorizationRequestService {

    private static final Logger log = LoggerFactory.getLogger(AuthorizationRequestService.class);

    private final AuthorizationRequestRepository requests;
    private final StatusHistoryRepository history;
    private final NotificationRepository notifications;
    private final CopilotService copilot;
    private final RequestMapper mapper;
    private final PriorAuthFhirMapper fhirMapper;
    private final PayerClient payerClient;

    public AuthorizationRequestService(AuthorizationRequestRepository requests,
                                       StatusHistoryRepository history,
                                       NotificationRepository notifications,
                                       CopilotService copilot,
                                       RequestMapper mapper,
                                       PriorAuthFhirMapper fhirMapper,
                                       PayerClient payerClient) {
        this.requests = requests;
        this.history = history;
        this.notifications = notifications;
        this.copilot = copilot;
        this.mapper = mapper;
        this.fhirMapper = fhirMapper;
        this.payerClient = payerClient;
    }

    @Transactional
    public AuthorizationRequest create(AuthorizationRequestDto dto) {
        AuthorizationRequest entity = new AuthorizationRequest();
        mapper.apply(dto, entity);
        entity.setCreatedAt(Instant.now());
        entity.setUpdatedAt(Instant.now());
        entity = requests.save(entity);
        entity.setRequestNumber("PA-%d-%05d".formatted(Year.now().getValue(), entity.getId()));
        history.save(new StatusHistory(entity.getId(), null, AuthorizationStatus.DRAFT, "provider", "Request created"));
        return entity;
    }

    @Transactional
    public AuthorizationRequest update(Long id, AuthorizationRequestDto dto) {
        AuthorizationRequest entity = get(id);
        if (!entity.getStatus().isEditable()) {
            throw new InvalidStateException(
                    "Request %s cannot be edited in status %s".formatted(entity.getRequestNumber(), entity.getStatus()));
        }
        mapper.apply(dto, entity);
        entity.setUpdatedAt(Instant.now());
        return entity;
    }

    @Transactional(readOnly = true)
    public AuthorizationRequest get(Long id) {
        return requests.findById(id)
                .orElseThrow(() -> new NotFoundException("Authorization request %d not found".formatted(id)));
    }

    @Transactional(readOnly = true)
    public List<AuthorizationRequest> list(AuthorizationStatus status) {
        return status == null
                ? requests.findAllByOrderByUpdatedAtDesc()
                : requests.findByStatusOrderByUpdatedAtDesc(status);
    }

    @Transactional(readOnly = true)
    public List<StatusHistory> historyOf(Long requestId) {
        return history.findByRequestIdOrderByOccurredAtAsc(requestId);
    }

    @Transactional(readOnly = true)
    public CopilotReport copilotReview(Long id) {
        return copilot.review(get(id));
    }

    /** Runs the copilot and, if clean, submits the request to the payer as a FHIR bundle. */
    @Transactional
    public AuthorizationRequest submit(Long id) {
        AuthorizationRequest entity = get(id);
        AuthorizationStatus from = entity.getStatus();
        if (!from.canTransitionTo(AuthorizationStatus.SUBMITTED)) {
            throw new InvalidStateException(
                    "Request %s cannot be submitted from status %s".formatted(entity.getRequestNumber(), from));
        }

        CopilotReport report = copilot.review(entity);
        if (!report.readyToSubmit()) {
            throw new CopilotBlockedException(report);
        }

        boolean resubmission = from == AuthorizationStatus.INFO_REQUESTED;
        transition(entity, AuthorizationStatus.SUBMITTED, "provider",
                resubmission ? "Resubmitted with additional information" : "Submitted to payer");
        entity.setSubmittedAt(Instant.now());

        String bundleJson = fhirMapper.toRequestBundleJson(mapper.toPriorAuthData(entity));
        String ackJson = payerClient.submitClaimBundle(bundleJson);
        DecisionData ack = fhirMapper.fromClaimResponseJson(ackJson);

        entity.setPayerCaseNumber(ack.getCaseNumber());
        transition(entity, AuthorizationStatus.PENDING_REVIEW, "payer",
                "Acknowledged by payer under case " + ack.getCaseNumber());
        notify("Request submitted", "%s was received by the payer and is pending review (case %s)."
                .formatted(entity.getRequestNumber(), ack.getCaseNumber()), "INFO", entity.getId());
        log.info("Submitted {} to payer, case {}", entity.getRequestNumber(), ack.getCaseNumber());
        return entity;
    }

    /** Applies a decision received from the payer. */
    @Transactional
    public AuthorizationRequest applyDecision(DecisionData decision) {
        AuthorizationRequest entity = requests.findByRequestNumber(decision.getRequestNumber())
                .orElseThrow(() -> new NotFoundException(
                        "No authorization request with number " + decision.getRequestNumber()));

        AuthorizationStatus target = decision.getStatus();
        if (!entity.getStatus().canTransitionTo(target)) {
            throw new InvalidStateException("Cannot apply decision %s to request %s in status %s"
                    .formatted(target, entity.getRequestNumber(), entity.getStatus()));
        }
        entity.setPayerNote(decision.getNote());
        entity.setDecidedAt(Instant.now());
        transition(entity, target, "payer", decision.getNote());

        switch (target) {
            case APPROVED -> notify("Authorization approved 🎉",
                    "%s was approved by the payer. %s".formatted(entity.getRequestNumber(), safe(decision.getNote())),
                    "SUCCESS", entity.getId());
            case REJECTED -> notify("Authorization rejected",
                    "%s was rejected. Reason: %s".formatted(entity.getRequestNumber(), safe(decision.getNote())),
                    "ERROR", entity.getId());
            case INFO_REQUESTED -> notify("More information requested",
                    "The payer needs more information for %s: %s Edit the request and resubmit."
                            .formatted(entity.getRequestNumber(), safe(decision.getNote())),
                    "WARNING", entity.getId());
            default -> notify("Status update", "%s moved to %s".formatted(entity.getRequestNumber(), target),
                    "INFO", entity.getId());
        }
        return entity;
    }

    private void transition(AuthorizationRequest entity, AuthorizationStatus to, String actor, String note) {
        history.save(new StatusHistory(entity.getId(), entity.getStatus(), to, actor, note));
        entity.setStatus(to);
        entity.setUpdatedAt(Instant.now());
    }

    private void notify(String title, String message, String type, Long referenceId) {
        notifications.save(new Notification(title, message, type, referenceId));
    }

    private String safe(String note) {
        return note == null ? "" : note;
    }

    public static class NotFoundException extends RuntimeException {
        public NotFoundException(String message) {
            super(message);
        }
    }

    public static class InvalidStateException extends RuntimeException {
        public InvalidStateException(String message) {
            super(message);
        }
    }

    /** Thrown when copilot errors block submission. */
    public static class CopilotBlockedException extends RuntimeException {
        private final CopilotReport report;

        public CopilotBlockedException(CopilotReport report) {
            super("Submission blocked: the AI copilot found issues that must be fixed first.");
            this.report = report;
        }

        public CopilotReport getReport() {
            return report;
        }
    }
}
