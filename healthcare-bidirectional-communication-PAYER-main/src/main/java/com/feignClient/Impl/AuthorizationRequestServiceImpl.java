package com.feignClient.Impl;


import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.feignClient.Auth.AuthorizationRequest;
import com.feignClient.Auth.Notification;
import com.feignClient.Repository.AuthorizationRequestRepository;
import com.feignClient.Repository.NotificationRepository;
import com.feignClient.Service.AuthorizationRequestService;
import com.feignClient.dto.DashboardDto;


@Service
public class AuthorizationRequestServiceImpl implements AuthorizationRequestService {

    @Autowired
    private AuthorizationRequestRepository repository;

    @Autowired
    private NotificationRepository notificationRepository;
    // =========================
    // 1. CREATE (PROVIDER)
    // =========================
    @Override
    public AuthorizationRequest createRequest(AuthorizationRequest req) {

        if(req.getProviderId() == null)
            throw new RuntimeException("Provider ID required");

        if(req.getPatientId() == null || req.getPatientId().isEmpty())
            throw new RuntimeException("Patient ID required");

        if(req.getPatientName() == null || req.getPatientName().isEmpty())
            throw new RuntimeException("Patient Name required");

        if(req.getDisease() == null || req.getDisease().isEmpty())
            throw new RuntimeException("Disease required");

        if(req.getTreatment() == null || req.getTreatment().isEmpty())
            throw new RuntimeException("Treatment required");

        // AI SCORE (rule-based)
        int score = 100;

        if(req.getPatientName().length() < 3) score -= 20;
        if(req.getDisease().length() < 3) score -= 20;
        if(req.getTreatment().length() < 3) score -= 20;

        req.setAiScore(score);
        req.setStatus("PENDING");

        return repository.save(req);
    }

    // =========================
    // 2. GET ALL (PAYER VIEW)
    // =========================
    @Override
    public List<AuthorizationRequest> getAllRequests() {
        return repository.findAll();
    }

    // =========================
    // 3. APPROVE (PAYER)
    // =========================
    @Override
    public AuthorizationRequest approveRequest(Long id) {

        AuthorizationRequest req = repository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Request not found"));

        if (!"PENDING".equals(req.getStatus()) &&
            !"RESUBMITTED".equals(req.getStatus())) {

            throw new RuntimeException(
                    "Only Pending or Resubmitted requests can be approved");
        }

        req.setStatus("APPROVED");
        req.setPayerComments(null);

        return repository.save(req);
    }

    // =========================
    // 4. REJECT (PAYER)
    // =========================
    @Override
    public AuthorizationRequest rejectRequest(Long id, String comment) {

        AuthorizationRequest req = repository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Request not found"));

        // Comment is mandatory
        if (comment == null || comment.isBlank()) {
            throw new RuntimeException("Rejection comment required");
        }

        // Only Pending or Resubmitted requests can be rejected
        if (!"PENDING".equals(req.getStatus()) &&
            !"RESUBMITTED".equals(req.getStatus())) {

            throw new RuntimeException(
                    "Only Pending or Resubmitted requests can be rejected");
        }

        // Update request
        req.setStatus("REJECTED");
        req.setPayerComments(comment);


        Notification notification = new Notification();
        notification.setProviderId(req.getProviderId());
        notification.setRequestId(req.getId());
        notification.setMessage(
            "Authorization Request ID "
            + req.getId()
            + " was rejected. Reason: "
            + comment
        );
        notification.setIsRead(false);

        notificationRepository.save(notification);

        notificationRepository.save(notification);

        return repository.save(req);
    }
    @Override
    public AuthorizationRequest resubmit(Long id, AuthorizationRequest updated) {

        AuthorizationRequest req = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        if (!"REJECTED".equals(req.getStatus())) {
            throw new RuntimeException("Only rejected requests can be resubmitted");
        }

        if (updated.getPatientName() == null || updated.getPatientName().isEmpty() ||
            updated.getDisease() == null || updated.getDisease().isEmpty() ||
            updated.getTreatment() == null || updated.getTreatment().isEmpty()) {

            throw new RuntimeException("All fields are required for resubmission");
        }

        req.setPatientName(updated.getPatientName());
        req.setDisease(updated.getDisease());
        req.setTreatment(updated.getTreatment());

        req.setStatus("RESUBMITTED");
        req.setPayerComments(null);

        return repository.save(req);
    }
    
    @Override
    public DashboardDto getDashboardStats() {

        List<AuthorizationRequest> list = repository.findAll();

        DashboardDto dto = new DashboardDto();

        dto.setPending(
                list.stream().filter(r -> "PENDING".equals(r.getStatus())).count()
        );

        dto.setApproved(
                list.stream().filter(r -> "APPROVED".equals(r.getStatus())).count()
        );

        dto.setRejected(
                list.stream().filter(r -> "REJECTED".equals(r.getStatus())).count()
        );

        dto.setResubmitted(
                list.stream().filter(r -> "RESUBMITTED".equals(r.getStatus())).count()
        );

        return dto;
    }
}