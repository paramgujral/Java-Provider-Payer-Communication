package com.healthcare.connector.authorization.service;

import com.healthcare.connector.ai.service.AiCopilotService;
import com.healthcare.connector.auth.entity.User;
import com.healthcare.connector.auth.enums.UserRole;
import com.healthcare.connector.auth.repository.UserRepository;
import com.healthcare.connector.authorization.dto.AuthorizationDTO;
import com.healthcare.connector.authorization.entity.AuthorizationRequest;
import com.healthcare.connector.authorization.entity.StatusHistory;
import com.healthcare.connector.authorization.enums.AuthorizationStatus;
import com.healthcare.connector.authorization.repository.AuthorizationRequestRepository;
import com.healthcare.connector.authorization.repository.StatusHistoryRepository;
import com.healthcare.connector.fhir.dto.FhirValidationResult;
import com.healthcare.connector.fhir.service.FhirService;
import com.healthcare.connector.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class AuthorizationService {

    private final AuthorizationRequestRepository authRepo;
    private final UserRepository userRepo;
    private final StatusHistoryRepository statusHistoryRepo;
    private final NotificationService notificationService;
    private final FhirService fhirService;
    private final AiCopilotService aiCopilotService;

    // ─── CREATE ──────────────────────────────────────────────────────────────

    public AuthorizationDTO.Response createRequest(AuthorizationDTO.CreateRequest req, User provider) {
        User payer = userRepo.findById(req.getPayerId())
                .orElseThrow(() -> new IllegalArgumentException("Payer not found"));

        String refNumber = generateReferenceNumber();

        AuthorizationRequest entity = AuthorizationRequest.builder()
                .referenceNumber(refNumber)
                .patientId(req.getPatientId() != null ? req.getPatientId() : "P-" + UUID.randomUUID().toString().substring(0, 8))
                .patientName(req.getPatientName())
                .patientDob(req.getPatientDob())
                .patientMemberId(req.getPatientMemberId())
                .patientInsuranceId(req.getPatientInsuranceId())
                .provider(provider)
                .providerNpi(provider.getOrganizationId())
                .providerName(provider.getFullName())
                .facilityName(provider.getOrganizationName())
                .payer(payer)
                .payerOrganizationId(payer.getOrganizationId())
                .payerName(payer.getOrganizationName())
                .diagnosisCode(req.getDiagnosisCode())
                .diagnosisDescription(req.getDiagnosisDescription())
                .procedureCode(req.getProcedureCode())
                .procedureDescription(req.getProcedureDescription())
                .serviceType(req.getServiceType())
                .requestedStartDate(req.getRequestedStartDate())
                .requestedEndDate(req.getRequestedEndDate())
                .numberOfUnits(req.getNumberOfUnits())
                .placeOfService(req.getPlaceOfService())
                .clinicalNotes(req.getClinicalNotes())
                .priority(req.getPriority())
                .documentUrls(req.getDocumentUrls() != null ? req.getDocumentUrls() : List.of())
                .status(AuthorizationStatus.DRAFT)
                .expiresAt(LocalDate.now().plusDays(30))
                .build();

        // Generate FHIR bundle
        try {
            String fhirBundle = fhirService.buildAuthorizationBundle(entity);
            entity.setFhirBundleJson(fhirBundle);
            entity.setFhirResourceId("auth-" + refNumber);
        } catch (Exception e) {
            log.warn("FHIR bundle generation failed: {}", e.getMessage());
        }

        entity = authRepo.save(entity);
        recordStatusChange(entity, null, AuthorizationStatus.DRAFT, provider.getUsername(), "Initial creation");
        return toResponse(entity);
    }

    // ─── AI REVIEW ────────────────────────────────────────────────────────────

    public AuthorizationDTO.AiReviewResponse requestAiReview(Long id, User requestor) {
        AuthorizationRequest entity = findAndCheckAccess(id, requestor);

        FhirValidationResult fhirResult = fhirService.validateAuthorizationRequest(entity);
        AuthorizationDTO.AiReviewResponse review = aiCopilotService.reviewRequest(entity, fhirResult);

        entity.setAiReviewed(true);
        entity.setAiReviewSummary(review.getSummary());
        entity.setAiConfidenceScore(review.getConfidenceScore());
        entity.setAiSuggestions(review.getSuggestions());
        if (entity.getStatus() == AuthorizationStatus.DRAFT) {
            entity.setStatus(AuthorizationStatus.AI_REVIEWED);
            entity.setReviewedAt(LocalDateTime.now());
            recordStatusChange(entity, AuthorizationStatus.DRAFT, AuthorizationStatus.AI_REVIEWED,
                    "AI_COPILOT", "Automated AI review completed");
        }
        authRepo.save(entity);
        notificationService.sendAiReviewCompleteNotification(entity);
        return review;
    }

    // ─── SUBMIT ───────────────────────────────────────────────────────────────

    public AuthorizationDTO.Response submitToPayer(Long id, User provider) {
        AuthorizationRequest entity = findAndCheckAccess(id, provider);
        if (entity.getProvider() == null || !entity.getProvider().getId().equals(provider.getId())) {
            throw new IllegalStateException("Only the submitting provider can submit this request");
        }

        AuthorizationStatus prev = entity.getStatus();
        entity.setStatus(AuthorizationStatus.SUBMITTED);
        entity.setSubmittedAt(LocalDateTime.now());
        authRepo.save(entity);

        recordStatusChange(entity, prev, AuthorizationStatus.SUBMITTED, provider.getUsername(), "Submitted to payer");
        notificationService.sendStatusChangeNotification(entity, prev.name(), AuthorizationStatus.SUBMITTED.name());
        return toResponse(entity);
    }

    // ─── PAYER DECISION ───────────────────────────────────────────────────────

    public AuthorizationDTO.Response recordPayerDecision(Long id, AuthorizationDTO.PayerDecisionRequest req,
                                                         User payerUser) {
        AuthorizationRequest entity = authRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Request not found"));

        if (!entity.getPayer().getId().equals(payerUser.getId())) {
            throw new IllegalStateException("Only the assigned payer can record decisions");
        }

        AuthorizationStatus prev = entity.getStatus();
        entity.setStatus(req.getDecision());
        entity.setPayerDecision(req.getDecision().name());
        entity.setPayerAuthorizationNumber(req.getAuthorizationNumber());
        entity.setPayerDecisionReason(req.getDecisionReason());
        entity.setPayerNotes(req.getNotes());
        entity.setApprovedStartDate(req.getApprovedStartDate());
        entity.setApprovedEndDate(req.getApprovedEndDate());
        entity.setApprovedUnits(req.getApprovedUnits());
        entity.setDecidedAt(LocalDateTime.now());
        authRepo.save(entity);

        recordStatusChange(entity, prev, req.getDecision(), payerUser.getUsername(), req.getDecisionReason());
        notificationService.sendPayerDecisionNotification(entity);
        return toResponse(entity);
    }

    // ─── QUERY ────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public Page<AuthorizationDTO.Response> getRequestsForUser(User user, String query,
                                                              AuthorizationStatus status, Pageable pageable) {
        Page<AuthorizationRequest> page;
        if (user.getRole() == UserRole.PROVIDER) {
            page = (query != null && !query.isBlank())
                    ? authRepo.searchByProvider(user, query, pageable)
                    : (status != null ? authRepo.findByProviderAndStatus(user, status, pageable)
                       : authRepo.findByProvider(user, pageable));
        } else {
            page = (query != null && !query.isBlank())
                    ? authRepo.searchByPayer(user, query, pageable)
                    : (status != null ? authRepo.findByPayerAndStatus(user, status, pageable)
                       : authRepo.findByPayer(user, pageable));
        }
        return page.map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public AuthorizationDTO.Response getById(Long id, User user) {
        return toResponse(findAndCheckAccess(id, user));
    }

    @Transactional(readOnly = true)
    public AuthorizationDTO.DashboardStats getDashboardStats(User user) {
        if (user.getRole() == UserRole.PROVIDER) {
            return AuthorizationDTO.DashboardStats.builder()
                    .total(authRepo.countByProviderAndStatus(user, AuthorizationStatus.SUBMITTED)
                            + authRepo.countByProviderAndStatus(user, AuthorizationStatus.APPROVED)
                            + authRepo.countByProviderAndStatus(user, AuthorizationStatus.DENIED)
                            + authRepo.countByProviderAndStatus(user, AuthorizationStatus.DRAFT))
                    .pending(authRepo.countByProviderAndStatus(user, AuthorizationStatus.SUBMITTED)
                            + authRepo.countByProviderAndStatus(user, AuthorizationStatus.UNDER_REVIEW))
                    .approved(authRepo.countByProviderAndStatus(user, AuthorizationStatus.APPROVED))
                    .denied(authRepo.countByProviderAndStatus(user, AuthorizationStatus.DENIED))
                    .pendingInfo(authRepo.countByProviderAndStatus(user, AuthorizationStatus.PENDING_INFO))
                    .aiReviewed(authRepo.countByProviderAndStatus(user, AuthorizationStatus.AI_REVIEWED))
                    .submitted(authRepo.countByProviderAndStatus(user, AuthorizationStatus.SUBMITTED))
                    .draft(authRepo.countByProviderAndStatus(user, AuthorizationStatus.DRAFT))
                    .build();
        } else {
            return AuthorizationDTO.DashboardStats.builder()
                    .total(authRepo.countByPayerAndStatus(user, AuthorizationStatus.SUBMITTED)
                            + authRepo.countByPayerAndStatus(user, AuthorizationStatus.APPROVED)
                            + authRepo.countByPayerAndStatus(user, AuthorizationStatus.DENIED))
                    .pending(authRepo.countByPayerAndStatus(user, AuthorizationStatus.SUBMITTED)
                            + authRepo.countByPayerAndStatus(user, AuthorizationStatus.UNDER_REVIEW))
                    .approved(authRepo.countByPayerAndStatus(user, AuthorizationStatus.APPROVED))
                    .denied(authRepo.countByPayerAndStatus(user, AuthorizationStatus.DENIED))
                    .pendingInfo(authRepo.countByPayerAndStatus(user, AuthorizationStatus.PENDING_INFO))
                    .aiReviewed(0L)
                    .submitted(authRepo.countByPayerAndStatus(user, AuthorizationStatus.SUBMITTED))
                    .draft(0L)
                    .build();
        }
    }

    @Transactional(readOnly = true)
    public List<AuthorizationDTO.StatusHistoryResponse> getStatusHistory(Long id, User user) {
        AuthorizationRequest entity = findAndCheckAccess(id, user);
        return statusHistoryRepo.findByAuthorizationRequestOrderByChangedAtAsc(entity)
                .stream().map(h -> AuthorizationDTO.StatusHistoryResponse.builder()
                        .fromStatus(h.getFromStatus())
                        .toStatus(h.getToStatus())
                        .changedBy(h.getChangedBy())
                        .changeReason(h.getChangeReason())
                        .changedAt(h.getChangedAt())
                        .build())
                .collect(Collectors.toList());
    }

    // ─── HELPERS ──────────────────────────────────────────────────────────────

    private AuthorizationRequest findAndCheckAccess(Long id, User user) {
        AuthorizationRequest entity = authRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Request not found: " + id));

        boolean hasAccess =
                (entity.getProvider() != null && entity.getProvider().getId().equals(user.getId()))
                        || (entity.getPayer() != null && entity.getPayer().getId().equals(user.getId()));

        if (!hasAccess) throw new IllegalStateException("Access denied");
        return entity;
    }

    private void recordStatusChange(AuthorizationRequest entity, AuthorizationStatus from,
                                    AuthorizationStatus to, String changedBy, String reason) {
        StatusHistory history = StatusHistory.builder()
                .authorizationRequest(entity)
                .fromStatus(from)
                .toStatus(to)
                .changedBy(changedBy)
                .changeReason(reason)
                .build();
        statusHistoryRepo.save(history);
    }

    private String generateReferenceNumber() {
        String date = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        return "AUTH-" + date + "-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();
    }

    public AuthorizationDTO.Response toResponse(AuthorizationRequest e) {
        return AuthorizationDTO.Response.builder()
                .id(e.getId())
                .referenceNumber(e.getReferenceNumber())
                .fhirResourceId(e.getFhirResourceId())
                .patientId(e.getPatientId())
                .patientName(e.getPatientName())
                .patientDob(e.getPatientDob())
                .patientMemberId(e.getPatientMemberId())
                .patientInsuranceId(e.getPatientInsuranceId())
                .providerNpi(e.getProviderNpi())
                .providerName(e.getProviderName())
                .facilityName(e.getFacilityName())
                .payerName(e.getPayerName())
                .payerOrganizationId(e.getPayerOrganizationId())
                .diagnosisCode(e.getDiagnosisCode())
                .diagnosisDescription(e.getDiagnosisDescription())
                .procedureCode(e.getProcedureCode())
                .procedureDescription(e.getProcedureDescription())
                .serviceType(e.getServiceType())
                .requestedStartDate(e.getRequestedStartDate())
                .requestedEndDate(e.getRequestedEndDate())
                .numberOfUnits(e.getNumberOfUnits())
                .placeOfService(e.getPlaceOfService())
                .clinicalNotes(e.getClinicalNotes())
                .priority(e.getPriority())
                .documentUrls(e.getDocumentUrls())
                .status(e.getStatus())
                .statusLabel(formatStatusLabel(e.getStatus()))
                .aiReviewed(e.isAiReviewed())
                .aiReviewSummary(e.getAiReviewSummary())
                .aiConfidenceScore(e.getAiConfidenceScore())
                .aiSuggestions(e.getAiSuggestions())
                .payerDecision(e.getPayerDecision())
                .payerAuthorizationNumber(e.getPayerAuthorizationNumber())
                .payerDecisionReason(e.getPayerDecisionReason())
                .payerNotes(e.getPayerNotes())
                .approvedStartDate(e.getApprovedStartDate())
                .approvedEndDate(e.getApprovedEndDate())
                .approvedUnits(e.getApprovedUnits())
                .submittedAt(e.getSubmittedAt())
                .reviewedAt(e.getReviewedAt())
                .decidedAt(e.getDecidedAt())
                .createdAt(e.getCreatedAt())
                .updatedAt(e.getUpdatedAt())
                .expiresAt(e.getExpiresAt())
                .versionNumber(e.getVersionNumber())
                .build();
    }

    private String formatStatusLabel(AuthorizationStatus status) {
        return switch (status) {
            case DRAFT -> "Draft";
            case PENDING_REVIEW -> "Pending Review";
            case AI_REVIEWED -> "AI Reviewed";
            case SUBMITTED -> "Submitted to Payer";
            case UNDER_REVIEW -> "Under Payer Review";
            case APPROVED -> "Approved";
            case PARTIALLY_APPROVED -> "Partially Approved";
            case DENIED -> "Denied";
            case PENDING_INFO -> "Additional Info Required";
            case CANCELLED -> "Cancelled";
            case EXPIRED -> "Expired";
        };
    }
}