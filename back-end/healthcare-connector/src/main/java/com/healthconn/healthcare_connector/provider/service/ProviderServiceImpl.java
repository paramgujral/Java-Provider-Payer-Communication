package com.healthconn.healthcare_connector.provider.service;


import com.healthconn.healthcare_connector.authentication.entity.Role;
import com.healthconn.healthcare_connector.authentication.entity.User;
import com.healthconn.healthcare_connector.authentication.repository.UserRepository;
import com.healthconn.healthcare_connector.notification.service.NotificationService;
import com.healthconn.healthcare_connector.provider.dto.AuthRequestResponseDto;
import com.healthconn.healthcare_connector.provider.dto.SubmitRequestDto;
import com.healthconn.healthcare_connector.provider.entity.AuthorizationRequest;
import com.healthconn.healthcare_connector.provider.entity.Priority;
import com.healthconn.healthcare_connector.provider.entity.RequestStatus;
import com.healthconn.healthcare_connector.provider.repository.AuthorizationRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProviderServiceImpl implements ProviderService {

    private final AuthorizationRequestRepository requestRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Override
    @Transactional
    public AuthRequestResponseDto submitRequest(SubmitRequestDto dto, Long providerId) {
        User provider = userRepository.findById(providerId)
                .orElseThrow(() -> new RuntimeException("Provider not found"));

        AuthorizationRequest request = AuthorizationRequest.builder()
                .patientName(dto.patientName())
                .patientId(dto.patientId())
                .insuranceId(dto.insuranceId())
                .diagnosisCode(dto.diagnosisCode())
                .procedureCode(dto.procedureCode())
                .treatmentDescription(dto.treatmentDescription())
                .admissionDate(dto.admissionDate())
                .expectedDischargeDate(dto.expectedDischargeDate())
                .priority(dto.priority() != null ? dto.priority() : Priority.NORMAL)
                .status(RequestStatus.SUBMITTED)
                .provider(provider)
                .build();

        AuthorizationRequest saved = requestRepository.save(request);

        // Notify all payers via WebSocket
        List<User> payers = userRepository.findByRole(Role.PAYER);
        notificationService.notifyPayersNewRequest(saved, payers);

        return toDto(saved);
    }

    @Override
    public List<AuthRequestResponseDto> getMyRequests(Long providerId) {
        return requestRepository.findByProviderIdOrderByCreatedAtDesc(providerId)
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