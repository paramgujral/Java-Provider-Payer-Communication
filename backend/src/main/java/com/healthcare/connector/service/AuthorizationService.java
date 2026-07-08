package com.healthcare.connector.service;

import com.healthcare.connector.Utils.SecurityUtils;
import com.healthcare.connector.enums.RequestStatus;
import com.healthcare.connector.enums.ResponseStatus;
import com.healthcare.connector.models.*;
import com.healthcare.connector.repositories.*;
import jakarta.transaction.Transactional;
import org.hl7.fhir.r4.model.Claim;
import org.hl7.fhir.r4.model.ClaimResponse;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class AuthorizationService {

    private final AuthorizationRequestRepository requestRepo;
    private final AuthorizationResponseRepository responseRepo;
    private final AiReviewRepository aiReviewRepo;
    private final NotificationService notificationService;
    private final FhirMapperService fhirMapper;
    private final AICopilotService aiCopilot;
    private final ProviderRepository providerRepo;
    private final PayerRepository payerRepo;
    private final UserRepository userRepository;

    public AuthorizationService(AuthorizationRequestRepository requestRepo,
                                AuthorizationResponseRepository responseRepo,
                                AiReviewRepository aiReviewRepo,
                                NotificationService notificationService,
                                FhirMapperService fhirMapper,
                                AICopilotService aiCopilot,
                                ProviderRepository providerRepo,
                                PayerRepository payerRepo,
                                UserRepository userRepository) {
        this.requestRepo = requestRepo;
        this.responseRepo = responseRepo;
        this.aiReviewRepo = aiReviewRepo;
        this.notificationService = notificationService;
        this.fhirMapper = fhirMapper;
        this.aiCopilot = aiCopilot;
        this.providerRepo = providerRepo;
        this.payerRepo = payerRepo;
        this.userRepository = userRepository;
    }

    // ─── PROVIDER ACTIONS ──────────────────────────────────────────────

    public AuthorizationRequest createRequest(String patientId, String serviceType, Long payerId) {
        String username = SecurityUtils.getCurrentUsername();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Provider provider = providerRepo.findById(user.getProviderId())
                .orElseThrow(() -> new RuntimeException("Provider not found"));

        Payer payer = payerRepo.findById(payerId)
                .orElseThrow(() -> new RuntimeException("Payer not found"));

        AuthorizationRequest request = new AuthorizationRequest();
        request.setRequestId(UUID.randomUUID().toString());
        request.setProvider(provider);
        request.setPayer(payer);
        request.setPatientId(patientId);
        request.setServiceType(serviceType);
        request.setRequestDate(LocalDateTime.now());
        request.setStatus(RequestStatus.PENDING);

        // Build FHIR Claim and store JSON
        Claim claim = fhirMapper.buildClaim(request);
        request.setFhirClaimJson(fhirMapper.toJson(claim));

        return requestRepo.save(request);
    }

    public AuthorizationRequest submitRequest(Long requestId) {
        AuthorizationRequest request = requestRepo.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        // 1. Run AI review
        AiReview aiReview = aiCopilot.reviewRequest(request);
        aiReview.setRequest(request);
        aiReview.setReviewDate(LocalDateTime.now());
        aiReviewRepo.save(aiReview);

        // 2. Determine if score passes
        if (aiReview.getScore() < 80) {
            request.setStatus(RequestStatus.REJECTED);
            String message = "AI review failed. Score: " + aiReview.getScore() +
                    ". Issues: " + aiReview.getIssues();
            notificationService.sendNotification(request, message);
        } else {
            request.setStatus(RequestStatus.SUBMITTED);
            notificationService.sendNotification(request, "Request passed AI review and submitted to payer.");
        }
        request.setUpdatedAt(LocalDateTime.now());
        return requestRepo.save(request);
    }

    public List<AuthorizationRequest> getProviderRequests() {
        String username = SecurityUtils.getCurrentUsername();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return requestRepo.findByProviderId(user.getProviderId());
    }

    public AiReview getAiReviewForRequest(Long requestId) {
        return aiReviewRepo.findByRequestId(requestId)
                .orElseThrow(() -> new RuntimeException("AI review not found for this request"));
    }

    // ─── PAYER ACTIONS ──────────────────────────────────────────────────

    public List<AuthorizationRequest> getPayerPendingRequests() {
        String username = SecurityUtils.getCurrentUsername();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return requestRepo.findByPayerIdAndStatus(user.getPayerId(), RequestStatus.SUBMITTED);
    }

    public AuthorizationResponse respondToRequest(Long requestId, ResponseStatus status, String notes) {
        String username = SecurityUtils.getCurrentUsername();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        AuthorizationRequest request = requestRepo.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        // Security: ensure this request belongs to the logged-in payer
        if (!request.getPayer().getId().equals(user.getPayerId())) {
            throw new AccessDeniedException("This request does not belong to your payer organization.");
        }

        AuthorizationResponse response = new AuthorizationResponse();
        response.setRequest(request);
        response.setResponseId(UUID.randomUUID().toString());
        response.setStatus(status);
        response.setDecisionDate(LocalDateTime.now());
        response.setNotes(notes);
        // Build ClaimResponse
        ClaimResponse claimResponse = fhirMapper.buildClaimResponse(response);
        response.setFhirClaimResponseJson(fhirMapper.toJson(claimResponse));
        responseRepo.save(response);

        // Update request status
        request.setStatus(status == ResponseStatus.APPROVED ? RequestStatus.APPROVED : RequestStatus.REJECTED);
        requestRepo.save(request);

        // Notify provider
        notificationService.sendNotification(request, "Payer " + status.name().toLowerCase() + " your request. Notes: " + notes);

        return response;
    }
}
