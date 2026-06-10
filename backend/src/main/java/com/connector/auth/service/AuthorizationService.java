package com.connector.auth.service;

import com.connector.auth.domain.*;
import com.connector.auth.dto.*;
import com.connector.auth.repository.AuthorizationRequestRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.time.Year;
import java.util.List;

@Service
@Transactional
public class AuthorizationService {

    private final AuthorizationRequestRepository repo;
    private final CopilotService copilotService;
    private final NotificationService notificationService;

    public AuthorizationService(AuthorizationRequestRepository repo,
                                CopilotService copilotService,
                                NotificationService notificationService) {
        this.repo = repo;
        this.copilotService = copilotService;
        this.notificationService = notificationService;
    }

    // ---------------- Provider side ----------------

    /** Build an entity from a DTO (not yet persisted). */
    public AuthorizationRequest fromDto(CreateRequestDto dto) {
        AuthorizationRequest r = new AuthorizationRequest();
        r.setPatientMrn(dto.patientMrn);
        r.setPatientName(dto.patientName);
        r.setPatientBirthDate(dto.patientBirthDate);
        r.setPatientGender(dto.patientGender);
        r.setMemberId(dto.memberId);
        r.setPayerName(dto.payerName);
        r.setPlanName(dto.planName);
        r.setProviderNpi(dto.providerNpi);
        r.setProviderName(dto.providerName);
        r.setProviderOrg(dto.providerOrg);
        r.setProviderSpecialty(dto.providerSpecialty);
        r.setPriority(dto.priority == null ? "NORMAL" : dto.priority.toUpperCase());
        r.setPlaceOfService(dto.placeOfService);
        r.setServiceStart(dto.serviceStart);
        r.setServiceEnd(dto.serviceEnd);
        r.setClinicalNotes(dto.clinicalNotes);

        int i = 1;
        if (dto.diagnoses != null) {
            for (DiagnosisDto d : dto.diagnoses) {
                DiagnosisCode dc = new DiagnosisCode();
                dc.setSequenceNo(i++);
                dc.setIcd10Code(d.icd10Code);
                dc.setDescription(d.description);
                dc.setIsPrincipal(Boolean.TRUE.equals(d.isPrincipal));
                r.addDiagnosis(dc);
            }
        }
        int s = 1;
        if (dto.serviceLines != null) {
            for (ServiceLineDto sl : dto.serviceLines) {
                ServiceLine line = new ServiceLine();
                line.setSequenceNo(s++);
                line.setCptCode(sl.cptCode);
                line.setDescription(sl.description);
                line.setUnits(sl.units == null ? 1 : sl.units);
                line.setUnitType(sl.unitType);
                r.addServiceLine(line);
            }
        }
        return r;
    }

    /** Run the Copilot review against a (possibly unsaved) draft. Does not persist. */
    public CopilotReview previewReview(CreateRequestDto dto) {
        return copilotService.review(fromDto(dto));
    }

    /** Create + submit a request to the payer in one step, attaching the Copilot review. */
    public AuthorizationRequest submit(CreateRequestDto dto) {
        AuthorizationRequest r = fromDto(dto);
        r.setReference(nextReference());
        r.setStatus(RequestStatus.DRAFT);
        r.addEvent(new StatusEvent(RequestStatus.DRAFT.name(), "PROVIDER", "Request created"));

        // attach Copilot review (cached)
        CopilotReview review = copilotService.review(r);
        r.setCopilotReview(review);
        r.setReadinessScore(review.getReadinessScore());
        r.setPredictedOutcome(review.getPredictedOutcome());
        r.addEvent(new StatusEvent("COPILOT_REVIEWED", "COPILOT",
                review.getSource() + " review: score " + review.getReadinessScore() + "/100"));

        // submit -> queue for payer
        r.setStatus(RequestStatus.PENDING_REVIEW);
        r.addEvent(new StatusEvent(RequestStatus.SUBMITTED.name(), "PROVIDER",
                "Submitted to " + r.getPayerName()));
        r.addEvent(new StatusEvent(RequestStatus.PENDING_REVIEW.name(), "PAYER", "Received and queued"));

        AuthorizationRequest saved = repo.save(r);
        notificationService.push(saved.getId(), "PAYER", "New authorization request",
                saved.getReference() + " from " + saved.getProviderOrg() + " is awaiting review.", "INFO");
        return eagerLoad(saved);
    }

    // ---------------- Payer side ----------------

    public List<AuthorizationRequest> payerQueue() {
        return repo.findByStatusInOrderByCreatedAtDesc(
                List.of(RequestStatus.PENDING_REVIEW, RequestStatus.INFO_REQUESTED))
                .stream().map(this::eagerLoad).toList();
    }

    public AuthorizationRequest decide(Long id, DecisionDto dto) {
        AuthorizationRequest r = get(id);
        Decision decision = Decision.valueOf(dto.decision.toUpperCase());
        r.setDecision(decision);
        r.setDecisionRationale(dto.rationale);

        String notifLevel;
        String notifTitle;
        String notifMsg;

        switch (decision) {
            case APPROVED, PARTIAL -> {
                r.setStatus(decision == Decision.APPROVED ? RequestStatus.APPROVED : RequestStatus.APPROVED);
                r.setAuthorizationNumber(dto.authorizationNumber != null ? dto.authorizationNumber : "AUTH-" + System.currentTimeMillis());
                r.setAuthValidFrom(dto.authValidFrom);
                r.setAuthValidTo(dto.authValidTo);
                r.addEvent(new StatusEvent(RequestStatus.APPROVED.name(), "PAYER",
                        "Approved - " + r.getAuthorizationNumber()));
                notifLevel = "SUCCESS";
                notifTitle = "Authorization approved";
                notifMsg = r.getReference() + " approved. Auth #" + r.getAuthorizationNumber()
                        + (r.getAuthValidTo() != null ? " valid through " + r.getAuthValidTo() : "") + ".";
            }
            case DENIED -> {
                r.setStatus(RequestStatus.DENIED);
                r.addEvent(new StatusEvent(RequestStatus.DENIED.name(), "PAYER",
                        dto.rationale == null ? "Denied" : dto.rationale));
                notifLevel = "DANGER";
                notifTitle = "Authorization denied";
                notifMsg = r.getReference() + " was denied. " + (dto.rationale == null ? "" : dto.rationale);
            }
            case INFO_REQUESTED -> {
                r.setStatus(RequestStatus.INFO_REQUESTED);
                r.addEvent(new StatusEvent(RequestStatus.INFO_REQUESTED.name(), "PAYER",
                        dto.rationale == null ? "Additional information requested" : dto.rationale));
                notifLevel = "WARNING";
                notifTitle = "Additional information required";
                notifMsg = r.getReference() + " needs more documentation. " + (dto.rationale == null ? "" : dto.rationale);
            }
            default -> throw new IllegalArgumentException("Unsupported decision: " + decision);
        }

        AuthorizationRequest saved = repo.save(r);
        notificationService.push(saved.getId(), "PROVIDER", notifTitle, notifMsg, notifLevel);
        return eagerLoad(saved);
    }

    /** Provider responds to an INFO_REQUESTED item with updated documentation. */
    public AuthorizationRequest resubmit(Long id, String addedNotes) {
        AuthorizationRequest r = get(id);
        if (addedNotes != null && !addedNotes.isBlank()) {
            String merged = (r.getClinicalNotes() == null ? "" : r.getClinicalNotes() + "\n\n")
                    + "[Additional documentation] " + addedNotes;
            r.setClinicalNotes(merged);
        }
        // re-run copilot
        CopilotReview review = copilotService.review(r);
        r.setCopilotReview(review);
        r.setReadinessScore(review.getReadinessScore());
        r.setPredictedOutcome(review.getPredictedOutcome());
        r.setStatus(RequestStatus.PENDING_REVIEW);
        r.setDecision(null);
        r.addEvent(new StatusEvent(RequestStatus.PENDING_REVIEW.name(), "PROVIDER",
                "Resubmitted with additional documentation"));
        AuthorizationRequest saved = repo.save(r);
        notificationService.push(saved.getId(), "PAYER", "Updated request resubmitted",
                saved.getReference() + " has been resubmitted with additional documentation.", "INFO");
        return eagerLoad(saved);
    }

    // ---------------- Tracking ----------------

    public List<AuthorizationRequest> all() {
        return repo.findAllByOrderByCreatedAtDesc().stream().map(this::eagerLoad).toList();
    }

    public AuthorizationRequest get(Long id) {
        return eagerLoad(repo.findById(id).orElseThrow(() ->
                new IllegalArgumentException("Request not found: " + id)));
    }

    /** Touch all lazy collections so Jackson can serialize after the session closes. */
    private AuthorizationRequest eagerLoad(AuthorizationRequest r) {
        r.getDiagnoses().size();
        r.getServiceLines().size();
        r.getHistory().size();
        if (r.getCopilotReview() != null) r.getCopilotReview().getIssues().size();
        return r;
    }

    private String nextReference() {
        String ref;
        long n = repo.count() + 1;
        do {
            ref = String.format("PA-%d-%04d", Year.now().getValue(), n++);
        } while (repo.existsByReference(ref));
        return ref;
    }
}
