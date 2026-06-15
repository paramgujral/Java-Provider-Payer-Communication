package com.healthcare.service.impl;

import com.healthcare.dto.AiReviewResponse;
import com.healthcare.dto.AuthorizationRequestDto;
import com.healthcare.dto.CommunicationNoteDto;
import com.healthcare.entity.AuditLog;
import com.healthcare.entity.AuthorizationRequest;
import com.healthcare.exception.ResourceNotFoundException;
import com.healthcare.repository.AuditLogRepository;
import com.healthcare.repository.AuthorizationRequestRepository;
import com.healthcare.service.AiCopilotService;
import com.healthcare.service.AuthorizationService;
import com.healthcare.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class AuthorizationServiceImpl implements AuthorizationService {

    private final AuthorizationRequestRepository repository;
    private final NotificationService notificationService;
    private final AuditLogRepository auditLogRepository;
    private final AiCopilotService aiCopilotService;
    private final com.healthcare.repository.NetworkAffiliationRepository networkAffiliationRepository;

    @Override
    public AuthorizationRequest createRequest(AuthorizationRequestDto dto) {
        log.info("Creating new authorization request for provider: {}", dto.getProviderId());

        // ENFORCE NETWORK AFFILIATION
        com.healthcare.entity.NetworkAffiliation affiliation = networkAffiliationRepository
                .findByProviderIdAndPayerId(dto.getProviderId(), dto.getPayerId())
                .orElseThrow(() -> new RuntimeException("Access Denied: You must request network affiliation with this Payer before submitting requests."));

        if (affiliation.getStatus() != com.healthcare.entity.NetworkAffiliation.AffiliationStatus.APPROVED) {
            throw new RuntimeException("Access Denied: Your network affiliation request with this Payer is currently " + affiliation.getStatus());
        }

        // Map DTO to Entity
        AuthorizationRequest request = AuthorizationRequest.builder()
                .providerId(dto.getProviderId())
                .payerId(dto.getPayerId())
                .patientInfo(mapPatientInfo(dto.getPatientInfo()))
                .diagnosisCodes(dto.getDiagnosisCodes())
                .procedureCodes(dto.getProcedureCodes())
                .serviceType(dto.getServiceType())
                .urgency(dto.getUrgency())
                .coverageInfo(mapCoverageInfo(dto.getCoverageInfo()))
                .status(AuthorizationRequest.RequestStatus.PENDING)
                .communicationNotes(new ArrayList<>())
                .build();

        AuthorizationRequest saved = repository.save(request);

        // Audit
        logAudit(saved.getId(), dto.getProviderId(), "CREATE", null, "PENDING",
                "Authorization request created by provider " + dto.getProviderId());

        // Notify the Payer
        notificationService.notifyStatusChange(saved, AuthorizationRequest.RequestStatus.PENDING);

        return saved;
    }

    @Override
    public AuthorizationRequest getRequestById(String id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Authorization request not found with id: " + id));
    }

    @Override
    public Page<AuthorizationRequest> getRequestsByProvider(String providerId, Pageable pageable) {
        return repository.findByProviderId(providerId, pageable);
    }

    @Override
    public Page<AuthorizationRequest> getRequestsByPayer(String payerId, Pageable pageable) {
        return repository.findByPayerId(payerId, pageable);
    }

    @Override
    public AuthorizationRequest updateStatus(String id, AuthorizationRequest.RequestStatus newStatus) {
        log.info("Updating status for request: {} to {}", id, newStatus);
        AuthorizationRequest request = getRequestById(id);
        String previousStatus = request.getStatus().name();

        request.setStatus(newStatus);
        AuthorizationRequest saved = repository.save(request);

        // Audit
        logAudit(id, request.getPayerId(), "UPDATE_STATUS", previousStatus, newStatus.name(),
                "Status changed from " + previousStatus + " to " + newStatus.name());

        // Notify
        notificationService.notifyStatusChange(saved, newStatus);

        return saved;
    }

    @Override
    public AuthorizationRequest addCommunicationNote(String id, CommunicationNoteDto noteDto) {
        log.info("Adding communication note to request: {} by {}", id, noteDto.getAuthorRole());
        AuthorizationRequest request = getRequestById(id);

        AuthorizationRequest.CommunicationNote note = AuthorizationRequest.CommunicationNote.builder()
                .authorId(noteDto.getAuthorId())
                .authorRole(noteDto.getAuthorRole())
                .content(noteDto.getContent())
                .timestamp(Instant.now())
                .build();

        if (request.getCommunicationNotes() == null) {
            request.setCommunicationNotes(new ArrayList<>());
        }
        request.getCommunicationNotes().add(note);
        AuthorizationRequest saved = repository.save(request);

        // Audit
        logAudit(id, noteDto.getAuthorId(), "ADD_NOTE", null, null,
                noteDto.getAuthorRole() + " added a note: " + noteDto.getContent());

        return saved;
    }

    @Override
    public List<AuditLog> getAuditTrail(String authorizationRequestId) {
        return auditLogRepository.findByAuthorizationRequestIdOrderByTimestampDesc(authorizationRequestId);
    }

    @Override
    public Mono<AiReviewResponse> adjudicateRequest(String id) {
        log.info("Running AI adjudication for request: {}", id);
        try {
            AuthorizationRequest request = getRequestById(id);
            return aiCopilotService.adjudicateRequest(request);
        } catch (Exception e) {
            log.error("Failed to run AI adjudication for request {}: {}", id, e.getMessage());
            AiReviewResponse fallback = new AiReviewResponse();
            fallback.setConfidenceScore(0.0);
            fallback.addSuggestion("AI adjudication service encountered an error: " + e.getMessage());
            return Mono.just(fallback);
        }
    }

    // --- Private Helpers ---

    private void logAudit(String requestId, String performedBy, String action,
                          String previousStatus, String newStatus, String details) {
        AuditLog auditLog = AuditLog.builder()
                .authorizationRequestId(requestId)
                .performedBy(performedBy)
                .action(action)
                .previousStatus(previousStatus)
                .newStatus(newStatus)
                .details(details)
                .build();
        auditLogRepository.save(auditLog);
    }

    private AuthorizationRequest.PatientInfo mapPatientInfo(AuthorizationRequestDto.PatientInfoDto dto) {
        if (dto == null) return null;
        AuthorizationRequest.PatientInfo info = new AuthorizationRequest.PatientInfo();
        info.setMemberId(dto.getMemberId());
        info.setFirstName(dto.getFirstName());
        info.setLastName(dto.getLastName());
        info.setDateOfBirth(dto.getDateOfBirth());
        info.setGender(dto.getGender());
        info.setPhone(dto.getPhone());
        return info;
    }

    private AuthorizationRequest.CoverageInfo mapCoverageInfo(AuthorizationRequestDto.CoverageInfoDto dto) {
        if (dto == null) return null;
        AuthorizationRequest.CoverageInfo info = new AuthorizationRequest.CoverageInfo();
        info.setInsurancePlanId(dto.getInsurancePlanId());
        info.setGroupNumber(dto.getGroupNumber());
        info.setSubscriberId(dto.getSubscriberId());
        info.setRelationshipToSubscriber(dto.getRelationshipToSubscriber());
        return info;
    }
}
