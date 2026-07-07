package com.healthconn.healthcare_connector.payer.service;


import com.healthconn.healthcare_connector.authentication.entity.User;
import com.healthconn.healthcare_connector.authentication.repository.UserRepository;
import com.healthconn.healthcare_connector.notification.service.NotificationService;
import com.healthconn.healthcare_connector.payer.dto.ReviewRequestDto;
import com.healthconn.healthcare_connector.provider.dto.AuthRequestResponseDto;
import com.healthconn.healthcare_connector.provider.entity.AuthorizationRequest;
import com.healthconn.healthcare_connector.provider.entity.RequestStatus;
import com.healthconn.healthcare_connector.provider.repository.AuthorizationRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PayerServiceImpl implements PayerService {

    private final AuthorizationRequestRepository requestRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Override
    public List<AuthRequestResponseDto> getPendingRequests() {
        return requestRepository
                .findByStatusInOrderByCreatedAtDesc(
                        List.of(RequestStatus.SUBMITTED, RequestStatus.UNDER_REVIEW))
                .stream().map(this::toDto).toList();
    }

    @Override
    @Transactional
    public AuthRequestResponseDto reviewRequest(Long requestId,
                                                ReviewRequestDto dto,
                                                Long payerId) {
        AuthorizationRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found: " + requestId));

        if (request.getStatus() != RequestStatus.SUBMITTED
                && request.getStatus() != RequestStatus.UNDER_REVIEW) {
            throw new RuntimeException("Request already finalized");
        }

        User payer = userRepository.findById(payerId)
                .orElseThrow(() -> new RuntimeException("Payer not found"));

        request.setStatus(dto.decision());
        request.setReviewNotes(dto.reviewNotes());
        request.setRejectionReason(dto.rejectionReason());
        request.setReviewedBy(payer);
        request.setReviewedAt(LocalDateTime.now());

        AuthorizationRequest updated = requestRepository.save(request);

        // Notify provider of decision via WebSocket
        notificationService.notifyProviderDecision(updated);

        return toDto(updated);
    }

    @Override
    public List<AuthRequestResponseDto> getAllRequests() {
        return requestRepository.findAllByOrderByCreatedAtDesc()
                .stream().map(this::toDto).toList();
    }

    private AuthRequestResponseDto toDto(AuthorizationRequest r) {
        return new AuthRequestResponseDto(
                r.getId(), r.getPatientName(), r.getPatientId(),
                r.getInsuranceId(), r.getProvider().getFullName(), r.getProvider().getId(),
                r.getDiagnosisCode(), r.getProcedureCode(), r.getTreatmentDescription(),
                r.getAdmissionDate(), r.getExpectedDischargeDate(),
                r.getPriority(), r.getStatus(),
                r.getRejectionReason(), r.getReviewNotes(),
                r.getCreatedAt(), r.getReviewedAt());
    }
}
