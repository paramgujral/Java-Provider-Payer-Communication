package com.healthconnect.platform.service;

import com.healthconnect.platform.dto.request.CreateAuthorizationRequest;
import com.healthconnect.platform.dto.request.ResubmitRequest;
import com.healthconnect.platform.dto.request.ReviewDecisionRequest;
import com.healthconnect.platform.dto.response.*;
import com.healthconnect.platform.entity.AuthorizationRequest;
import com.healthconnect.platform.entity.User;
import com.healthconnect.platform.enums.AuditAction;
import com.healthconnect.platform.enums.RequestStatus;
import com.healthconnect.platform.exception.BusinessException;
import com.healthconnect.platform.exception.ResourceNotFoundException;
import com.healthconnect.platform.repository.AuthorizationRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthorizationRequestService {

    private final AuthorizationRequestRepository requestRepository;
    private final AiCopilotService aiCopilotService;
    private final AuditLogService auditLogService;
    private final NotificationService notificationService;

    // ─── Provider Operations ───────────────────────────────────────────────────

    @Transactional
    public AuthorizationRequestResponse createDraft(CreateAuthorizationRequest dto, User provider) {
        AuthorizationRequest request = AuthorizationRequest.builder()
                .referenceNumber(generateReferenceNumber())
                .patientName(dto.getPatientName())
                .patientDob(dto.getPatientDob())
                .patientMemberId(dto.getPatientMemberId())
                .patientInsurancePlan(dto.getPatientInsurancePlan())
                .diagnosisCode(dto.getDiagnosisCode())
                .diagnosisDescription(dto.getDiagnosisDescription())
                .procedureCode(dto.getProcedureCode())
                .procedureDescription(dto.getProcedureDescription())
                .serviceType(dto.getServiceType())
                .requestedServiceDate(dto.getRequestedServiceDate())
                .requestedServiceEndDate(dto.getRequestedServiceEndDate())
                .facilityName(dto.getFacilityName())
                .treatingPhysician(dto.getTreatingPhysician())
                .clinicalNotes(dto.getClinicalNotes())
                .supportingDocuments(dto.getSupportingDocuments())
                .priority(dto.getPriority() != null ? dto.getPriority() : "NORMAL")
                .status(RequestStatus.DRAFT)
                .provider(provider)
                .build();

        // Run AI analysis and persist results
        AiAnalysisResponse ai = aiCopilotService.analyze(request);
        request.setAiCompletenessScore(ai.getCompletenessScore());
        request.setAiApprovalProbability(ai.getApprovalProbability());
        request.setAiRecommendations(aiCopilotService.serializeRecommendations(ai.getRecommendations()));

        AuthorizationRequest saved = requestRepository.save(request);

        auditLogService.log(saved, AuditAction.CREATED,
                "Authorization request created as draft", provider);

        // Warn provider if completeness is low
        if (ai.getCompletenessScore() < 60) {
            notificationService.notifyAiWarning(provider, saved,
                    "Completeness score is " + ai.getCompletenessScore() +
                    "%. Please review AI recommendations before submitting.");
        }

        return toResponse(saved);
    }

    @Transactional
    public AuthorizationRequestResponse submitRequest(Long requestId, User provider) {
        AuthorizationRequest request = getRequestOwnedBy(requestId, provider);

        if (request.getStatus() != RequestStatus.DRAFT &&
                request.getStatus() != RequestStatus.INFO_REQUESTED) {
            throw new BusinessException("Only DRAFT or INFO_REQUESTED requests can be submitted");
        }

        request.setStatus(RequestStatus.SUBMITTED);
        request.setSubmittedAt(LocalDateTime.now());

        // Re-run AI analysis on submit
        AiAnalysisResponse ai = aiCopilotService.analyze(request);
        request.setAiCompletenessScore(ai.getCompletenessScore());
        request.setAiApprovalProbability(ai.getApprovalProbability());
        request.setAiRecommendations(aiCopilotService.serializeRecommendations(ai.getRecommendations()));

        AuthorizationRequest saved = requestRepository.save(request);

        auditLogService.log(saved, AuditAction.SUBMITTED,
                "Request submitted for payer review", provider);

        return toResponse(saved);
    }

    @Transactional
    public AuthorizationRequestResponse resubmitRequest(Long requestId, ResubmitRequest dto, User provider) {
        AuthorizationRequest request = getRequestOwnedBy(requestId, provider);

        if (request.getStatus() != RequestStatus.INFO_REQUESTED) {
            throw new BusinessException("Only INFO_REQUESTED requests can be resubmitted");
        }

        // Apply updates
        if (dto.getClinicalNotes() != null)        request.setClinicalNotes(dto.getClinicalNotes());
        if (dto.getSupportingDocuments() != null)  request.setSupportingDocuments(dto.getSupportingDocuments());
        if (dto.getFacilityName() != null)         request.setFacilityName(dto.getFacilityName());
        if (dto.getTreatingPhysician() != null)    request.setTreatingPhysician(dto.getTreatingPhysician());
        if (dto.getDiagnosisCode() != null)        request.setDiagnosisCode(dto.getDiagnosisCode());
        if (dto.getDiagnosisDescription() != null) request.setDiagnosisDescription(dto.getDiagnosisDescription());
        if (dto.getProcedureCode() != null)        request.setProcedureCode(dto.getProcedureCode());
        if (dto.getProcedureDescription() != null) request.setProcedureDescription(dto.getProcedureDescription());

        request.setStatus(RequestStatus.RESUBMITTED);
        request.setSubmittedAt(LocalDateTime.now());

        // Re-run AI
        AiAnalysisResponse ai = aiCopilotService.analyze(request);
        request.setAiCompletenessScore(ai.getCompletenessScore());
        request.setAiApprovalProbability(ai.getApprovalProbability());
        request.setAiRecommendations(aiCopilotService.serializeRecommendations(ai.getRecommendations()));

        AuthorizationRequest saved = requestRepository.save(request);

        auditLogService.log(saved, AuditAction.RESUBMITTED,
                "Request resubmitted with additional information",
                dto.getAdditionalInfo(), provider);

        return toResponse(saved);
    }

    public List<AuthorizationRequestResponse> getProviderRequests(
            User provider, RequestStatus status, String search) {
        return requestRepository.findByProviderWithFilters(provider, status, search)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public AuthorizationRequestResponse getRequestById(Long id, User user) {
        AuthorizationRequest request = requestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Authorization request", id));

        // Providers can only view their own requests
        if (user.getRole().name().equals("PROVIDER") &&
                !request.getProvider().getId().equals(user.getId())) {
            throw new BusinessException("You do not have access to this request");
        }
        return toResponse(request);
    }

    public ProviderDashboardResponse getProviderDashboard(User provider) {
        return ProviderDashboardResponse.builder()
                .totalRequests(requestRepository.countByProvider(provider))
                .pendingRequests(requestRepository.countByProviderAndStatus(provider, RequestStatus.SUBMITTED)
                        + requestRepository.countByProviderAndStatus(provider, RequestStatus.IN_REVIEW)
                        + requestRepository.countByProviderAndStatus(provider, RequestStatus.RESUBMITTED))
                .approvedRequests(requestRepository.countByProviderAndStatus(provider, RequestStatus.APPROVED))
                .deniedRequests(requestRepository.countByProviderAndStatus(provider, RequestStatus.DENIED))
                .inReviewRequests(requestRepository.countByProviderAndStatus(provider, RequestStatus.IN_REVIEW))
                .infoRequestedRequests(requestRepository.countByProviderAndStatus(provider, RequestStatus.INFO_REQUESTED))
                .draftRequests(requestRepository.countByProviderAndStatus(provider, RequestStatus.DRAFT))
                .build();
    }

    // ─── Payer Operations ──────────────────────────────────────────────────────

    @Transactional
    public AuthorizationRequestResponse startReview(Long requestId, User reviewer) {
        AuthorizationRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Authorization request", requestId));

        if (request.getStatus() != RequestStatus.SUBMITTED &&
                request.getStatus() != RequestStatus.RESUBMITTED) {
            throw new BusinessException("Only SUBMITTED or RESUBMITTED requests can be reviewed");
        }

        request.setStatus(RequestStatus.IN_REVIEW);
        request.setReviewer(reviewer);
        request.setReviewedAt(LocalDateTime.now());

        AuthorizationRequest saved = requestRepository.save(request);
        auditLogService.log(saved, AuditAction.REVIEWED,
                "Review started by " + reviewer.getFullName(), reviewer);

        return toResponse(saved);
    }

    @Transactional
    public AuthorizationRequestResponse processDecision(Long requestId,
                                                         ReviewDecisionRequest dto,
                                                         User reviewer) {
        AuthorizationRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Authorization request", requestId));

        if (request.getStatus() != RequestStatus.IN_REVIEW &&
                request.getStatus() != RequestStatus.SUBMITTED &&
                request.getStatus() != RequestStatus.RESUBMITTED) {
            throw new BusinessException("Request is not in a reviewable state");
        }

        request.setReviewer(reviewer);
        request.setReviewerNotes(dto.getReviewerNotes());

        switch (dto.getDecision()) {
            case APPROVE -> {
                request.setStatus(RequestStatus.APPROVED);
                request.setResolvedAt(LocalDateTime.now());
                auditLogService.log(request, AuditAction.APPROVED,
                        "Request approved by " + reviewer.getFullName(),
                        dto.getReviewerNotes(), reviewer);
                notificationService.notifyApproved(request.getProvider(), request);
            }
            case DENY -> {
                if (dto.getDenialReason() == null || dto.getDenialReason().isBlank()) {
                    throw new BusinessException("Denial reason is required when denying a request");
                }
                request.setStatus(RequestStatus.DENIED);
                request.setDenialReason(dto.getDenialReason());
                request.setResolvedAt(LocalDateTime.now());
                auditLogService.log(request, AuditAction.DENIED,
                        "Request denied by " + reviewer.getFullName(),
                        dto.getDenialReason(), reviewer);
                notificationService.notifyDenied(request.getProvider(), request, dto.getDenialReason());
            }
            case REQUEST_INFO -> {
                if (dto.getAdditionalInfoRequested() == null || dto.getAdditionalInfoRequested().isBlank()) {
                    throw new BusinessException("Please specify what information is needed");
                }
                request.setStatus(RequestStatus.INFO_REQUESTED);
                request.setAdditionalInfoRequested(dto.getAdditionalInfoRequested());
                auditLogService.log(request, AuditAction.INFO_REQUESTED,
                        "Additional information requested by " + reviewer.getFullName(),
                        dto.getAdditionalInfoRequested(), reviewer);
                notificationService.notifyInfoRequested(request.getProvider(), request,
                        dto.getAdditionalInfoRequested());
            }
        }

        return toResponse(requestRepository.save(request));
    }

    public List<AuthorizationRequestResponse> getPayerQueue(RequestStatus status, String search) {
        return requestRepository.findPayerQueueWithFilters(status, search)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public PayerDashboardResponse getPayerDashboard() {
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        List<AuthorizationRequest> resolvedToday = requestRepository.findAllResolvedSince(startOfDay);

        long approvedToday = resolvedToday.stream()
                .filter(r -> r.getStatus() == RequestStatus.APPROVED).count();
        long deniedToday = resolvedToday.stream()
                .filter(r -> r.getStatus() == RequestStatus.DENIED).count();
        long processedToday = approvedToday + deniedToday;

        long pendingReviews = requestRepository.countByStatusIn(
                List.of(RequestStatus.SUBMITTED, RequestStatus.RESUBMITTED));

        double approvalRate = processedToday > 0
                ? Math.round((approvedToday * 100.0 / processedToday) * 10.0) / 10.0
                : 0.0;

        return PayerDashboardResponse.builder()
                .pendingReviews(pendingReviews)
                .processedToday(processedToday)
                .approvedToday(approvedToday)
                .deniedToday(deniedToday)
                .infoRequestedCount(requestRepository.countByStatus(RequestStatus.INFO_REQUESTED))
                .approvalRate(approvalRate)
                .totalInQueue(requestRepository.countByStatusIn(
                        List.of(RequestStatus.SUBMITTED, RequestStatus.RESUBMITTED,
                                RequestStatus.IN_REVIEW)))
                .build();
    }

    // ─── AI Copilot ───────────────────────────────────────────────────────────

    public AiAnalysisResponse analyzeRequest(Long requestId, User user) {
        AuthorizationRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Authorization request", requestId));
        return aiCopilotService.analyze(request);
    }

    // ─── Kanban / Status Tracking ─────────────────────────────────────────────

    public List<AuthorizationRequestResponse> getRequestsByStatus(RequestStatus status, User user) {
        if ("PROVIDER".equals(user.getRole().name())) {
            return requestRepository.findByProviderAndStatusOrderByCreatedAtDesc(user, status)
                    .stream().map(this::toResponse).collect(Collectors.toList());
        }
        return requestRepository.findByStatusOrderByCreatedAtAsc(status)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private AuthorizationRequest getRequestOwnedBy(Long requestId, User provider) {
        AuthorizationRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Authorization request", requestId));
        if (!request.getProvider().getId().equals(provider.getId())) {
            throw new BusinessException("You do not own this request");
        }
        return request;
    }

    private String generateReferenceNumber() {
        int year = LocalDate.now().getYear();
        long count = requestRepository.countByYear(year) + 1;
        return String.format("HC-%d-%05d", year, count);
    }

    public AuthorizationRequestResponse toResponse(AuthorizationRequest r) {
        return AuthorizationRequestResponse.builder()
                .id(r.getId())
                .referenceNumber(r.getReferenceNumber())
                .patientName(r.getPatientName())
                .patientDob(r.getPatientDob())
                .patientMemberId(r.getPatientMemberId())
                .patientInsurancePlan(r.getPatientInsurancePlan())
                .diagnosisCode(r.getDiagnosisCode())
                .diagnosisDescription(r.getDiagnosisDescription())
                .procedureCode(r.getProcedureCode())
                .procedureDescription(r.getProcedureDescription())
                .serviceType(r.getServiceType())
                .requestedServiceDate(r.getRequestedServiceDate())
                .requestedServiceEndDate(r.getRequestedServiceEndDate())
                .facilityName(r.getFacilityName())
                .treatingPhysician(r.getTreatingPhysician())
                .clinicalNotes(r.getClinicalNotes())
                .supportingDocuments(r.getSupportingDocuments())
                .aiCompletenessScore(r.getAiCompletenessScore())
                .aiApprovalProbability(r.getAiApprovalProbability())
                .aiRecommendations(aiCopilotService.deserializeRecommendations(r.getAiRecommendations()))
                .reviewerNotes(r.getReviewerNotes())
                .denialReason(r.getDenialReason())
                .additionalInfoRequested(r.getAdditionalInfoRequested())
                .status(r.getStatus())
                .statusDisplayName(r.getStatus().getDisplayName())
                .priority(r.getPriority())
                .providerId(r.getProvider().getId())
                .providerName(r.getProvider().getFullName())
                .providerOrganization(r.getProvider().getOrganization())
                .reviewerId(r.getReviewer() != null ? r.getReviewer().getId() : null)
                .reviewerName(r.getReviewer() != null ? r.getReviewer().getFullName() : null)
                .createdAt(r.getCreatedAt())
                .updatedAt(r.getUpdatedAt())
                .submittedAt(r.getSubmittedAt())
                .reviewedAt(r.getReviewedAt())
                .resolvedAt(r.getResolvedAt())
                .build();
    }
}
