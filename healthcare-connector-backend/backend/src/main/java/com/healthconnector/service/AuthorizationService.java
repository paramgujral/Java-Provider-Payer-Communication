package com.healthconnector.service;

import com.healthconnector.model.AuthorizationRequest;
import com.healthconnector.model.AuthorizationStatus;
import com.healthconnector.model.UserRole;
import com.healthconnector.repository.AuthorizationRequestRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.NoSuchElementException;

@Service
public class AuthorizationService {

    private final AuthorizationRequestRepository requestRepository;
    private final NotificationService notificationService;

    public AuthorizationService(AuthorizationRequestRepository requestRepository,
                                 NotificationService notificationService) {
        this.requestRepository = requestRepository;
        this.notificationService = notificationService;
    }

    public AuthorizationRequest submit(AuthorizationRequest request, String providerUsername) {
        request.setId(null);
        request.setProviderUsername(providerUsername);
        request.setStatus(AuthorizationStatus.SUBMITTED);
        request.setCreatedAt(LocalDateTime.now());
        request.setUpdatedAt(LocalDateTime.now());
        AuthorizationRequest saved = requestRepository.save(request);

        notificationService.notifyRole(
                UserRole.PAYER,
                "New authorization request submitted for patient " + saved.getPatientName(),
                saved.getId()
        );
        return saved;
    }

    public List<AuthorizationRequest> findByProvider(String providerUsername) {
        return requestRepository.findByProviderUsername(providerUsername);
    }

    public List<AuthorizationRequest> findAllForPayer() {
        return requestRepository.findAll();
    }

    public AuthorizationRequest decide(Long id, String decision, String notes) {
        AuthorizationRequest request = requestRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Request not found: " + id));

        AuthorizationStatus newStatus = "APPROVED".equalsIgnoreCase(decision)
                ? AuthorizationStatus.APPROVED
                : AuthorizationStatus.REJECTED;

        request.setStatus(newStatus);
        request.setPayerNotes(notes);
        request.setUpdatedAt(LocalDateTime.now());
        AuthorizationRequest saved = requestRepository.save(request);

        notificationService.notifyUser(
                saved.getProviderUsername(),
                UserRole.PROVIDER,
                "Your request for patient " + saved.getPatientName() + " was " + newStatus.name().toLowerCase() + ".",
                saved.getId()
        );
        return saved;
    }
}
