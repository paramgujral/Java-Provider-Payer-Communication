package com.healthconnect.service;

import com.healthconnect.dto.AuthorizationDtos.*;
import com.healthconnect.model.*;
import com.healthconnect.repository.AuthorizationRequestRepository;
import com.healthconnect.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Collectors;

@Service
public class AuthorizationRequestService {

    @Autowired
    private AuthorizationRequestRepository authRepo;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AiCopilotService aiCopilotService;

    @Autowired
    private NotificationService notificationService;

    // Simple in-memory counter to generate FHIR-style IDs (AUTH-YYYY-NNNNN)
    private final AtomicLong counter = new AtomicLong(1);

    /**
     * Provider creates a new authorization request (FHIR Claim resource).
     * Automatically runs the AI Copilot review and stores the results.
     */
    @Transactional
    public AuthorizationResponse createRequest(CreateRequest dto, User createdBy) {
        AuthorizationRequest req = new AuthorizationRequest();

        String year = String.valueOf(LocalDateTime.now().getYear());
        long seq = authRepo.count() + 1;
        req.setFhirId(String.format("AUTH-%s-%05d", year, seq));

        req.setPatientName(dto.getPatientName());
        req.setPatientDob(dto.getPatientDob());
        req.setPatientMemberId(dto.getPatientMemberId());
        req.setProviderOrgName(createdBy.getOrganizationName());
        req.setProviderNpi(dto.getProviderNpi());
        req.setPayerOrgName(dto.getPayerOrgName());
        req.setProcedureCode(dto.getProcedureCode());
        req.setProcedureDescription(dto.getProcedureDescription());
        req.setDiagnosisCode(dto.getDiagnosisCode());
        req.setDiagnosisDescription(dto.getDiagnosisDescription());
        req.setRequestedServiceDate(dto.getRequestedServiceDate());
        req.setClinicalNotes(dto.getClinicalNotes());
        req.setUnitsRequested(dto.getUnitsRequested());
        req.setStatus(AuthorizationStatus.DRAFT);
        req.setCreatedByUserId(createdBy.getId());

        // Run AI Copilot review immediately on creation
        CopilotReviewResponse review = aiCopilotService.review(req);
        req.setAiReviewSummary(buildSummaryText(review));
        req.setAiCompletenessScore(review.getCompletenessScore());
        req.setAiFlaggedIssues(review.getFlaggedIssues());

        AuthorizationRequest saved = authRepo.save(req);
        return toResponse(saved);
    }

    /**
     * Re-runs the AI Copilot review on demand (e.g. after the provider edits the draft).
     */
    @Transactional
    public CopilotReviewResponse runCopilotReview(String fhirId) {
        AuthorizationRequest req = getEntityByFhirId(fhirId);
        CopilotReviewResponse review = aiCopilotService.review(req);

        req.setAiReviewSummary(buildSummaryText(review));
        req.setAiCompletenessScore(review.getCompletenessScore());
        req.setAiFlaggedIssues(review.getFlaggedIssues());
        authRepo.save(req);

        return review;
    }

    /**
     * Provider submits a DRAFT request to the payer -> status becomes SUBMITTED.
     * Notifies all payer-org users.
     */
    @Transactional
    public AuthorizationResponse submitRequest(String fhirId, User submittedBy) {
        AuthorizationRequest req = getEntityByFhirId(fhirId);

        if (req.getCreatedByUserId() != submittedBy.getId() &&
                !req.getProviderOrgName().equals(submittedBy.getOrganizationName())) {
            throw new IllegalArgumentException("Not authorized to submit this request");
        }

        if (req.getStatus() != AuthorizationStatus.DRAFT && req.getStatus() != AuthorizationStatus.PENDED) {
            throw new IllegalArgumentException("Only DRAFT or PENDED requests can be submitted");
        }

        changeStatus(req, AuthorizationStatus.SUBMITTED, "Submitted to payer for review.", submittedBy.getUsername());

        // Notify payer-org users
        notifyOrgUsers(req.getPayerOrgName(), UserRole.PAYER,
                "New prior authorization request " + req.getFhirId() + " submitted by " + req.getProviderOrgName(),
                req.getFhirId());

        return toResponse(authRepo.save(req));
    }

    /**
     * Payer updates the status of a request (review, approve, reject, pend, etc.).
     * Notifies the provider org.
     */
    @Transactional
    public AuthorizationResponse updateStatus(String fhirId, StatusUpdateRequest dto, User reviewer) {
        AuthorizationRequest req = getEntityByFhirId(fhirId);

        if (!req.getPayerOrgName().equals(reviewer.getOrganizationName())) {
            throw new IllegalArgumentException("Not authorized to review this request");
        }

        AuthorizationStatus newStatus = dto.getStatus();
        String note = dto.getPayerResponseNotes();

        req.setPayerResponseNotes(note);
        if (dto.getApprovedUnits() != null) {
            req.setApprovedUnits(dto.getApprovedUnits());
        }

        changeStatus(req, newStatus, note != null ? note : ("Status updated to " + newStatus), reviewer.getUsername());

        // Notify provider org users
        String message = "Authorization " + req.getFhirId() + " status changed to " + newStatus
                + " by " + reviewer.getOrganizationName();
        notifyOrgUsers(req.getProviderOrgName(), UserRole.PROVIDER, message, req.getFhirId());

        return toResponse(authRepo.save(req));
    }

    /**
     * Provider cancels/withdraws a request.
     */
    @Transactional
    public AuthorizationResponse cancelRequest(String fhirId, User canceller) {
        AuthorizationRequest req = getEntityByFhirId(fhirId);

        if (!req.getProviderOrgName().equals(canceller.getOrganizationName())) {
            throw new IllegalArgumentException("Not authorized to cancel this request");
        }
        if (req.getStatus() == AuthorizationStatus.APPROVED || req.getStatus() == AuthorizationStatus.REJECTED) {
            throw new IllegalArgumentException("Cannot cancel a finalized request");
        }

        changeStatus(req, AuthorizationStatus.CANCELLED, "Withdrawn by provider.", canceller.getUsername());
        return toResponse(authRepo.save(req));
    }

    public AuthorizationResponse getByFhirId(String fhirId) {
        return toResponse(getEntityByFhirId(fhirId));
    }

    /**
     * Returns all requests visible to the given user:
     * - PROVIDER sees requests created by their organization
     * - PAYER sees requests addressed to their organization
     */
    public List<AuthorizationResponse> getRequestsForUser(User user) {
        List<AuthorizationRequest> results;
        if (user.getRole() == UserRole.PROVIDER) {
            results = authRepo.findByProviderOrgName(user.getOrganizationName());
        } else {
            results = authRepo.findByPayerOrgName(user.getOrganizationName());
        }
        return results.stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<AuthorizationResponse> getRequestsForUserByStatus(User user, AuthorizationStatus status) {
        return getRequestsForUser(user).stream()
                .filter(r -> r.getStatus() == status)
                .collect(Collectors.toList());
    }

    // -------------------- Helpers --------------------

    private AuthorizationRequest getEntityByFhirId(String fhirId) {
        return authRepo.findByFhirId(fhirId)
                .orElseThrow(() -> new IllegalArgumentException("Authorization request not found: " + fhirId));
    }

    private void changeStatus(AuthorizationRequest req, AuthorizationStatus newStatus, String note, String changedBy) {
        AuthorizationStatus old = req.getStatus();

        AuthorizationHistory history = new AuthorizationHistory();
        history.setAuthorizationRequest(req);
        history.setPreviousStatus(old);
        history.setNewStatus(newStatus);
        history.setNote(note);
        history.setChangedByUsername(changedBy);

        req.getHistory().add(history);
        req.setStatus(newStatus);
    }

    private void notifyOrgUsers(String orgName, UserRole role, String message, String fhirId) {
        List<User> orgUsers = userRepository.findAll().stream()
                .filter(u -> u.getOrganizationName().equals(orgName) && u.getRole() == role)
                .collect(Collectors.toList());

        for (User u : orgUsers) {
            notificationService.create(u.getId(), message, fhirId);
        }
    }

    private String buildSummaryText(CopilotReviewResponse review) {
        return review.getSummary();
    }

    private AuthorizationResponse toResponse(AuthorizationRequest req) {
        AuthorizationResponse resp = new AuthorizationResponse();
        resp.setId(req.getId());
        resp.setFhirId(req.getFhirId());
        resp.setPatientName(req.getPatientName());
        resp.setPatientDob(req.getPatientDob());
        resp.setPatientMemberId(req.getPatientMemberId());
        resp.setProviderOrgName(req.getProviderOrgName());
        resp.setProviderNpi(req.getProviderNpi());
        resp.setPayerOrgName(req.getPayerOrgName());
        resp.setProcedureCode(req.getProcedureCode());
        resp.setProcedureDescription(req.getProcedureDescription());
        resp.setDiagnosisCode(req.getDiagnosisCode());
        resp.setDiagnosisDescription(req.getDiagnosisDescription());
        resp.setRequestedServiceDate(req.getRequestedServiceDate());
        resp.setClinicalNotes(req.getClinicalNotes());
        resp.setUnitsRequested(req.getUnitsRequested());
        resp.setStatus(req.getStatus());
        resp.setPayerResponseNotes(req.getPayerResponseNotes());
        resp.setApprovedUnits(req.getApprovedUnits());
        resp.setAiReviewSummary(req.getAiReviewSummary());
        resp.setAiCompletenessScore(req.getAiCompletenessScore());
        resp.setAiFlaggedIssues(req.getAiFlaggedIssues());
        resp.setCreatedAt(req.getCreatedAt());
        resp.setUpdatedAt(req.getUpdatedAt());

        resp.setHistory(req.getHistory().stream().map(h -> {
            HistoryEntry he = new HistoryEntry();
            he.setPreviousStatus(h.getPreviousStatus());
            he.setNewStatus(h.getNewStatus());
            he.setNote(h.getNote());
            he.setChangedByUsername(h.getChangedByUsername());
            he.setChangedAt(h.getChangedAt());
            return he;
        }).collect(Collectors.toList()));

        return resp;
    }
}
