package com.healthcare.provider.service;

import com.healthcare.provider.entity.AuthorizationRequest;
import com.healthcare.provider.entity.Notification;
import com.healthcare.provider.repository.AuthorizationRepository;
import com.healthcare.provider.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AuthorizationService {

    private final AuthorizationRepository repository;
    private final AiClientService aiClientService;
    private final PayerClientService payerClientService;
    private final NotificationRepository notificationRepository;

    public AuthorizationRequest create(
            AuthorizationRequest request) {

        request.setStatus("DRAFT");

        return repository.save(request);
    }

    public List<AuthorizationRequest> getAll() {

        return repository.findAll();
    }

    public AuthorizationRequest getById(Long id) {

        return repository.findById(id)
                .orElseThrow(
                    () -> new RuntimeException(
                        "Request Not Found"));
    }

    public AuthorizationRequest reviewWithAi(
            Long id) {

        AuthorizationRequest request =
                repository.findById(id)
                        .orElseThrow();

        String recommendation =
                aiClientService.reviewRequest(
                        request);

        request.setAiRecommendation(
                recommendation);

        return repository.save(request);
    }

    public AuthorizationRequest submitToPayer(
            Long id) {

        AuthorizationRequest request =
                repository.findById(id)
                        .orElseThrow();

        payerClientService.submitToPayer(
                request);

        request.setStatus("SUBMITTED");

        return repository.save(request);
    }

    public AuthorizationRequest updateStatus(
            Long id,
            String status,
            String comments) {

        AuthorizationRequest request =
                repository.findById(id)
                        .orElseThrow();

        request.setStatus(status);

        repository.save(request);

        Notification notification =
                Notification.builder()
                        .requestId(id)
                        .message(
                                "Request " + status +
                                        " : " + comments)
                        .createdAt(
                                java.time.LocalDateTime.now())
                        .build();

        notificationRepository.save(
                notification);

        return request;
    }

    public AuthorizationRequest update(
            Long id,
            AuthorizationRequest updatedRequest) {

        AuthorizationRequest request =
                repository.findById(id)
                        .orElseThrow();

        request.setProviderName(
                updatedRequest.getProviderName());

        request.setPatientName(
                updatedRequest.getPatientName());

        request.setInsuranceId(
                updatedRequest.getInsuranceId());

        request.setDiagnosisCode(
                updatedRequest.getDiagnosisCode());

        request.setProcedureCode(
                updatedRequest.getProcedureCode());

        request.setClinicalNotes(
                updatedRequest.getClinicalNotes());

        request.setAiRecommendation(null);

        request.setStatus("DRAFT");

        return repository.save(request);
    }
}