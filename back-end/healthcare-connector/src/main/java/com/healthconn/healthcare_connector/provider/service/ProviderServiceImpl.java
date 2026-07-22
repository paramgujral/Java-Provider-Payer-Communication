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
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProviderServiceImpl implements ProviderService {

    private final AuthorizationRequestRepository requestRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Override
    @Transactional
    public AuthRequestResponseDto createAuthorizationRequest(SubmitRequestDto dto, Long providerId) {
        User provider = userRepository.findById(providerId)
                .orElseThrow(() -> new RuntimeException("Provider not found"));

        AuthorizationRequest request = AuthorizationRequest.builder()
                .patientName(dto.getPatientName())
                .patientId(dto.getPatientId())
                .insuranceId(dto.getInsuranceId())
                .diagnosisCode(dto.getDiagnosisCode())
                .procedureCode(dto.getProcedureCode())
                .treatmentDescription(dto.getTreatmentDescription())
                .admissionDate(dto.getAdmissionDate())
                .expectedDischargeDate(dto.getExpectedDischargeDate())
                .priority(dto.getPriority() != null ? dto.getPriority() : Priority.NORMAL)
                .status(RequestStatus.SUBMITTED)
                .provider(provider)
                .build();

        AuthorizationRequest saved = requestRepository.save(request);

        // Notify all payers via WebSocket
        List<User> payers = userRepository.findByRole(Role.PAYER);
        notificationService.notifyPayersNewRequest(saved, payers);

        return buildRequestResponse(saved);
    }

    @Override
    public List<AuthRequestResponseDto> getProviderRequests(Long providerId) {
        return requestRepository.findByProviderIdOrderByCreatedAtDesc(providerId)
                .stream().map(this::buildRequestResponse).collect(Collectors.toList());
    }

    private AuthRequestResponseDto buildRequestResponse(AuthorizationRequest r) {
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