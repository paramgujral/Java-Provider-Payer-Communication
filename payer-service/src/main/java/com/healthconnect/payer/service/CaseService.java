package com.healthconnect.payer.service;

import com.healthconnect.common.fhir.PriorAuthFhirMapper;
import com.healthconnect.common.model.AuthorizationStatus;
import com.healthconnect.common.model.DecisionData;
import com.healthconnect.common.model.PriorAuthData;
import com.healthconnect.common.model.Urgency;
import com.healthconnect.payer.domain.CaseHistory;
import com.healthconnect.payer.domain.Notification;
import com.healthconnect.payer.domain.PriorAuthCase;
import com.healthconnect.payer.repository.CaseHistoryRepository;
import com.healthconnect.payer.repository.NotificationRepository;
import com.healthconnect.payer.repository.PriorAuthCaseRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

/** Payer-side workflow: intake, review decisions, provider callbacks. */
@Service
public class CaseService {

    private static final Logger log = LoggerFactory.getLogger(CaseService.class);
    private static final BigDecimal HIGH_AMOUNT_THRESHOLD = new BigDecimal("50000");

    public enum ReviewAction { APPROVE, REJECT, REQUEST_INFO }

    private final PriorAuthCaseRepository cases;
    private final CaseHistoryRepository history;
    private final NotificationRepository notifications;
    private final PriorAuthFhirMapper fhirMapper;
    private final ProviderClient providerClient;

    public CaseService(PriorAuthCaseRepository cases,
                       CaseHistoryRepository history,
                       NotificationRepository notifications,
                       PriorAuthFhirMapper fhirMapper,
                       ProviderClient providerClient) {
        this.cases = cases;
        this.history = history;
        this.notifications = notifications;
        this.fhirMapper = fhirMapper;
        this.providerClient = providerClient;
    }

    /** Handles an incoming Claim bundle and returns the acknowledgement ClaimResponse. */
    @Transactional
    public String intake(String bundleJson) {
        PriorAuthData data = fhirMapper.fromRequestBundleJson(bundleJson);
        if (data.getRequestNumber() == null || data.getRequestNumber().isBlank()) {
            throw new InvalidSubmissionException("Claim bundle is missing the request-number identifier");
        }

        PriorAuthCase authCase = cases.findByRequestNumber(data.getRequestNumber()).orElse(null);
        if (authCase == null) {
            authCase = new PriorAuthCase();
            authCase.setRequestNumber(data.getRequestNumber());
            authCase.setReceivedAt(Instant.now());
            applyClaimData(authCase, data, bundleJson);
            authCase = cases.save(authCase);
            authCase.setCaseNumber("CASE-%05d".formatted(authCase.getId()));
            history.save(new CaseHistory(authCase.getId(), null, AuthorizationStatus.PENDING_REVIEW,
                    "provider", "Prior-authorization request received from " + data.getProviderName()));
            notifications.save(new Notification("New authorization request",
                    "%s from %s — %s for patient %s %s.".formatted(
                            authCase.getCaseNumber(), data.getProviderName(),
                            data.getProcedureDescription(), data.getPatientFirstName(), data.getPatientLastName()),
                    "INFO", authCase.getId()));
            log.info("Opened case {} for request {}", authCase.getCaseNumber(), data.getRequestNumber());
        } else {
            if (authCase.getStatus() != AuthorizationStatus.INFO_REQUESTED) {
                throw new InvalidSubmissionException("Request %s already exists under case %s and is not awaiting information"
                        .formatted(data.getRequestNumber(), authCase.getCaseNumber()));
            }
            AuthorizationStatus from = authCase.getStatus();
            authCase.setResubmissionCount(authCase.getResubmissionCount() + 1);
            applyClaimData(authCase, data, bundleJson);
            authCase.setStatus(AuthorizationStatus.PENDING_REVIEW);
            history.save(new CaseHistory(authCase.getId(), from, AuthorizationStatus.PENDING_REVIEW,
                    "provider", "Resubmission #" + authCase.getResubmissionCount() + " with additional information"));
            notifications.save(new Notification("Request resubmitted",
                    "%s was resubmitted with additional information and is back in the review queue."
                            .formatted(authCase.getCaseNumber()),
                    "INFO", authCase.getId()));
            log.info("Case {} re-entered review after resubmission", authCase.getCaseNumber());
        }

        DecisionData ack = new DecisionData(authCase.getRequestNumber(), authCase.getCaseNumber(),
                AuthorizationStatus.PENDING_REVIEW, "Queued for utilization review");
        return fhirMapper.toClaimResponseJson(ack, data);
    }

    private void applyClaimData(PriorAuthCase authCase, PriorAuthData data, String bundleJson) {
        authCase.setPatientFirstName(data.getPatientFirstName());
        authCase.setPatientLastName(data.getPatientLastName());
        authCase.setPatientDob(data.getPatientDob());
        authCase.setPatientGender(data.getPatientGender());
        authCase.setMemberId(data.getMemberId());
        authCase.setInsurancePlan(data.getInsurancePlan());
        authCase.setProviderName(data.getProviderName());
        authCase.setProviderNpi(data.getProviderNpi());
        authCase.setDiagnosisCode(data.getDiagnosisCode());
        authCase.setDiagnosisDescription(data.getDiagnosisDescription());
        authCase.setProcedureCode(data.getProcedureCode());
        authCase.setProcedureDescription(data.getProcedureDescription());
        authCase.setServiceDate(data.getServiceDate());
        authCase.setUrgency(data.getUrgency());
        authCase.setClinicalJustification(data.getClinicalJustification());
        authCase.setRequestedAmount(data.getRequestedAmount());
        authCase.setRawBundleJson(bundleJson);
        authCase.setUpdatedAt(Instant.now());
        authCase.setReviewFlags(String.join(",", triageFlags(authCase)));
    }

    private List<String> triageFlags(PriorAuthCase authCase) {
        List<String> flags = new ArrayList<>();
        if (authCase.getUrgency() != Urgency.ROUTINE) {
            flags.add("EXPEDITE");
        }
        if (authCase.getRequestedAmount() != null
                && authCase.getRequestedAmount().compareTo(HIGH_AMOUNT_THRESHOLD) > 0) {
            flags.add("HIGH_AMOUNT");
        }
        if (authCase.getResubmissionCount() > 0) {
            flags.add("RESUBMISSION");
        }
        return flags;
    }

    /** Records a reviewer decision and notifies the provider. */
    @Transactional
    public PriorAuthCase decide(Long caseId, ReviewAction action, String note) {
        PriorAuthCase authCase = get(caseId);
        if (authCase.getStatus() != AuthorizationStatus.PENDING_REVIEW) {
            throw new InvalidStateException("Case %s cannot be decided in status %s"
                    .formatted(authCase.getCaseNumber(), authCase.getStatus()));
        }
        if (action != ReviewAction.APPROVE && (note == null || note.isBlank())) {
            throw new InvalidStateException("A note explaining the decision is required for " + action);
        }

        AuthorizationStatus target = switch (action) {
            case APPROVE -> AuthorizationStatus.APPROVED;
            case REJECT -> AuthorizationStatus.REJECTED;
            case REQUEST_INFO -> AuthorizationStatus.INFO_REQUESTED;
        };
        AuthorizationStatus from = authCase.getStatus();
        authCase.setStatus(target);
        authCase.setDecisionNote(note);
        authCase.setDecidedAt(Instant.now());
        authCase.setUpdatedAt(Instant.now());
        history.save(new CaseHistory(authCase.getId(), from, target, "payer-reviewer", note));

        String claimResponseJson = fhirMapper.toClaimResponseJson(
                new DecisionData(authCase.getRequestNumber(), authCase.getCaseNumber(), target, note),
                toPriorAuthData(authCase));
        boolean delivered = providerClient.sendDecision(claimResponseJson);

        notifications.save(new Notification(
                "Decision recorded: " + target,
                "%s (%s) decided as %s.%s".formatted(authCase.getCaseNumber(), authCase.getRequestNumber(), target,
                        delivered ? "" : " Warning: the provider callback could not be delivered."),
                delivered ? "SUCCESS" : "WARNING", authCase.getId()));
        log.info("Case {} decided as {} (callback delivered: {})", authCase.getCaseNumber(), target, delivered);
        return authCase;
    }

    @Transactional(readOnly = true)
    public PriorAuthCase get(Long id) {
        return cases.findById(id).orElseThrow(() -> new NotFoundException("Case %d not found".formatted(id)));
    }

    @Transactional(readOnly = true)
    public List<PriorAuthCase> list(AuthorizationStatus status) {
        return status == null
                ? cases.findAllByOrderByUpdatedAtDesc()
                : cases.findByStatusOrderByReceivedAtAsc(status);
    }

    @Transactional(readOnly = true)
    public List<CaseHistory> historyOf(Long caseId) {
        return history.findByCaseIdOrderByOccurredAtAsc(caseId);
    }

    private PriorAuthData toPriorAuthData(PriorAuthCase authCase) {
        PriorAuthData data = new PriorAuthData();
        data.setRequestNumber(authCase.getRequestNumber());
        data.setPatientFirstName(authCase.getPatientFirstName());
        data.setPatientLastName(authCase.getPatientLastName());
        data.setPayerName("Acme Health Insurance");
        return data;
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

    public static class InvalidSubmissionException extends RuntimeException {
        public InvalidSubmissionException(String message) {
            super(message);
        }
    }
}
