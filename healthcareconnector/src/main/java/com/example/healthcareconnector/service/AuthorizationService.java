package com.example.healthcareconnector.service;

import com.example.healthcareconnector.entity.AuthorizationRequest;
import com.example.healthcareconnector.enums.RequestStatus;
import com.example.healthcareconnector.repository.AuthorizationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AuthorizationService {
    private final AuthorizationRepository authorizationRepository;
    private final AiCopilotService aiCopilotService;
    private final NotificationService notificationService;

    public AuthorizationRequest createAuthorization(AuthorizationRequest request){
        request.setStatus(RequestStatus.AI_REVIEW_PENDING);

        String aiResponse = aiCopilotService.validateAuthorization(request);

        if(aiResponse.equals("APPROVED_BY_AI")){
            request.setStatus(RequestStatus.SUBMITTED_TO_PAYER);
            request.setAiRecommendation("AI validation successful. Request submitted to payer.");
        } else {
            request.setStatus(RequestStatus.CORRECTION_REQUIRED);
            request.setAiRecommendation(aiResponse);
        }

        return authorizationRepository.save(request);

    }

    public List<AuthorizationRequest> getAllRequests(){
        return authorizationRepository.findAll();
    }

    public AuthorizationRequest approveRequest(Long id){
        AuthorizationRequest request = authorizationRepository.findById(id)
                        .orElseThrow(() -> new RuntimeException("Request not found")
                        );

        request.setStatus(RequestStatus.APPROVED);
        request.setPayerComments("Authorization approved successfully");

        AuthorizationRequest saved = authorizationRepository.save(request);
        notificationService.sendNotification(saved);

        return saved;
    }

    public AuthorizationRequest rejectRequest(Long id, String reason){
        AuthorizationRequest request = authorizationRepository.findById(id)
                .orElseThrow(
                        () -> new RuntimeException("Authorization request not found")
                );

        request.setStatus(RequestStatus.REJECTED);
        request.setPayerComments(reason);

        AuthorizationRequest saved = authorizationRepository.save(request);
        notificationService.sendNotification(saved);

        return saved;
    }

    public AuthorizationRequest getRequestStatus(Long id) {
        return authorizationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Request not found"));
    }
}
