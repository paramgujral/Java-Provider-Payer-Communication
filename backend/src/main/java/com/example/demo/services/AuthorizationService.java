package com.example.demo.services;

import com.example.demo.dto.AIReviewResponseDTO;
import com.example.demo.dto.AuthorizationRequestDTO;
import com.example.demo.model.AuthorizationRequest;
import com.example.demo.model.Payer;
import com.example.demo.model.Provider;
import com.example.demo.model.RequestStatus;
import com.example.demo.repository.AuthorizationRequestRepository;
import com.example.demo.repository.PayerRepository;
import com.example.demo.repository.ProviderRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityNotFoundException;
import lombok.AllArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
@AllArgsConstructor
public class AuthorizationService {

    private final AuthorizationRequestRepository authorizationRequestRepository;
    private final ProviderRepository providerRepository;
    private final PayerRepository payerRepository;
    private final AICopilotService aiCopilotService;
    private final NotificationService notificationService;
    private final ReviewTokenStore reviewTokenStore;

    private static final Logger log =
            LoggerFactory.getLogger(AICopilotService.class);

    /**
     * Provider submits authorization request
     */
    public AuthorizationRequest submitRequest(
            AuthorizationRequestDTO dto) {

        Provider provider = providerRepository.findById(dto.getProviderId())
                .orElseThrow(() ->
                        new EntityNotFoundException("Provider not found"));

        Payer payer = payerRepository.findById(dto.getPayerId())
                .orElseThrow(() ->
                        new EntityNotFoundException("Payer not found"));

        log.info("Received authorization request with AI review token: {}", dto.getAiReviewToken());

        if(dto.getAiReviewToken() == null ||
                !reviewTokenStore.isValid(dto.getAiReviewToken())) {

            throw new RuntimeException(
                    "AI review required before submission");
        }

        reviewTokenStore.consume(
                dto.getAiReviewToken());



        AuthorizationRequest request =
                AuthorizationRequest.builder()
                        .patientName(dto.getPatientName())
                        .diagnosis(dto.getDiagnosis())
                        .procedureName(dto.getProcedureName())
                        .provider(provider)
                        .payer(payer)
                        .status(RequestStatus.PENDING)
                        .aiReviewPassed(true)
                        .aiReviewNotes("AI review completed")
                        .build();

        AuthorizationRequest saved =  authorizationRequestRepository.save(request);
        notificationService.sendNotification(
                provider.getId(),
                saved.getId(),
                "Your authorization request #" + saved.getId() + " has been submitted and is PENDING review."
        );
        return saved;
    }

    /**
     * Provider views own requests
     */
    public List<AuthorizationRequest> getProviderRequests(
            Long providerId) {

        return authorizationRequestRepository
                .findByProviderId(providerId);
    }

    /**
     * Payer views all requests
     */
    public List<AuthorizationRequest> getAllRequests() {
        return authorizationRequestRepository.findAll();
    }

    /**
     * Payer approves/rejects request
     */
    public AuthorizationRequest updateRequestStatus(
            Long requestId,
            RequestStatus status,
            String remarks) {

        AuthorizationRequest request =
                authorizationRequestRepository.findById(requestId)
                        .orElseThrow(() ->
                                new EntityNotFoundException(
                                        "Authorization Request not found"));

        request.setStatus(status);
        request.setPayerRemarks(remarks);

        AuthorizationRequest updated =
                authorizationRequestRepository.save(request);

        // In updateStatus() — after authRepository.save(request)
        notificationService.sendNotification(
                request.getProvider().getId(),
                request.getId(),
                "Your request #" + requestId + " has been " + status +
                        " by " + request.getPayer().getName() +
                        (remarks != null ? ". Remarks: " + remarks : "")
        );

        return updated;
    }

    /**
     * Get single request
     */
    public AuthorizationRequest getRequestById(Long requestId) {

        return authorizationRequestRepository.findById(requestId)
                .orElseThrow(() ->
                        new EntityNotFoundException(
                                "Authorization Request not found"));
    }

    public List<AuthorizationRequest> getAllRequestsByPayerId(
            Long payerId) {

        return authorizationRequestRepository
                .findByPayerId(payerId);
    }

    public List<AuthorizationRequest> getPendingRequests(
            Long payerId) {

        return authorizationRequestRepository
                .findByPayer_IdAndStatus(
                        payerId,
                        RequestStatus.PENDING
                );
    }




}
