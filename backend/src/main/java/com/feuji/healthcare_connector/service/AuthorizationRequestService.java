package com.feuji.healthcare_connector.service;

import com.feuji.healthcare_connector.entity.AuthorizationRequest;
import com.feuji.healthcare_connector.enums.RequestStatus;
import com.feuji.healthcare_connector.repository.AuthorizationRequestRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
public class AuthorizationRequestService {

    private final AuthorizationRequestRepository repository;
    private final AiReviewService aiReviewService;
    private final CommunicationService communicationService;

    public AuthorizationRequestService(
            AuthorizationRequestRepository repository,
            AiReviewService aiReviewService,
            CommunicationService communicationService
    ) {
        this.repository = repository;
        this.aiReviewService = aiReviewService;
        this.communicationService = communicationService;
    }

    public AuthorizationRequest create(AuthorizationRequest request) {

        request.createdDate = LocalDate.now();
        request.updatedDate = LocalDate.now();

        request.fhirRequestId = "FHIR-AUTH-" +
                UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        AiReviewService.AiReviewResult aiResult = aiReviewService.review(request);

        request.aiRecommendation = aiResult.recommendation();
        request.aiReason = aiResult.reason();

        if (aiResult.valid()) {
            request.status = RequestStatus.PENDING;
        } else {
            request.status = RequestStatus.NEEDS_CORRECTION;
        }

        AuthorizationRequest savedRequest = repository.save(request);

        communicationService.log(
                savedRequest.id,
                "PROVIDER",
                "AI_COPILOT",
                "REQUEST_SUBMITTED",
                "Provider submitted authorization request for AI review."
        );

        if (savedRequest.status == RequestStatus.NEEDS_CORRECTION) {
            communicationService.log(
                    savedRequest.id,
                    "AI_COPILOT",
                    "PROVIDER",
                    "CORRECTION_RECOMMENDED",
                    savedRequest.aiReason
            );
        } else {
            communicationService.log(
                    savedRequest.id,
                    "AI_COPILOT",
                    "PAYER",
                    "READY_FOR_PAYER_REVIEW",
                    "AI Copilot approved the request for payer review."
            );
        }

        return savedRequest;
    }

    public List<AuthorizationRequest> getAll() {
        return repository.findAll();
    }

    public AuthorizationRequest getById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Authorization request not found with id: " + id));
    }

    public AuthorizationRequest updateStatus(Long id, RequestStatus status) {
        AuthorizationRequest request = getById(id);

        request.status = status;
        request.updatedDate = LocalDate.now();

        if (status == RequestStatus.APPROVED) {
            request.aiReason = "Payer approved the authorization request.";
        }

        if (status == RequestStatus.REJECTED) {
            request.aiReason = "Payer rejected the authorization request. Provider needs to review and resubmit.";
        }

        AuthorizationRequest savedRequest = repository.save(request);

        if (status == RequestStatus.APPROVED) {
            communicationService.log(
                    savedRequest.id,
                    "PAYER",
                    "PROVIDER",
                    "AUTHORIZATION_APPROVED",
                    "Payer approved the authorization request."
            );
        }

        if (status == RequestStatus.REJECTED) {
            communicationService.log(
                    savedRequest.id,
                    "PAYER",
                    "PROVIDER",
                    "AUTHORIZATION_REJECTED",
                    "Payer rejected the authorization request. Provider must correct and resubmit."
            );
        }

        return savedRequest;
    }

    public AuthorizationRequest updateRequest(Long id, AuthorizationRequest updatedRequest) {
        AuthorizationRequest existing = getById(id);

        existing.patientName = updatedRequest.patientName;
        existing.memberId = updatedRequest.memberId;
        existing.providerName = updatedRequest.providerName;
        existing.providerNpi = updatedRequest.providerNpi;
        existing.payerName = updatedRequest.payerName;
        existing.payerId = updatedRequest.payerId;
        existing.diagnosisCode = updatedRequest.diagnosisCode;
        existing.procedureCode = updatedRequest.procedureCode;
        existing.clinicalNotes = updatedRequest.clinicalNotes;
        existing.updatedDate = LocalDate.now();

        AiReviewService.AiReviewResult aiResult = aiReviewService.review(existing);

        existing.aiRecommendation = aiResult.recommendation();
        existing.aiReason = aiResult.reason();

        if (aiResult.valid()) {
            existing.status = RequestStatus.PENDING;
        } else {
            existing.status = RequestStatus.NEEDS_CORRECTION;
        }

        AuthorizationRequest savedRequest = repository.save(existing);

        communicationService.log(
                savedRequest.id,
                "PROVIDER",
                "AI_COPILOT",
                "REQUEST_RESUBMITTED",
                "Provider corrected and resubmitted the authorization request."
        );

        if (savedRequest.status == RequestStatus.NEEDS_CORRECTION) {
            communicationService.log(
                    savedRequest.id,
                    "AI_COPILOT",
                    "PROVIDER",
                    "CORRECTION_STILL_REQUIRED",
                    savedRequest.aiReason
            );
        } else {
            communicationService.log(
                    savedRequest.id,
                    "AI_COPILOT",
                    "PAYER",
                    "READY_FOR_PAYER_REVIEW",
                    "Corrected request passed AI review and was sent to payer."
            );
        }

        return savedRequest;
    }
}