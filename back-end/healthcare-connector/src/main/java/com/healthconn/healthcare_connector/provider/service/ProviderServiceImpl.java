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

    // ==========================================================
    // Submit Authorization Request
    // ==========================================================

    @Override
    @Transactional
    public AuthRequestResponseDto submitRequest(
            SubmitRequestDto dto,
            Long providerId) {

        final User provider = userRepository.findById(providerId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Provider not found: " + providerId));

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

        AuthorizationRequest savedRequest = requestRepository.save(request);

        // Notify all payer users
        final List<User> payers =
                userRepository.findByRole(Role.PAYER);

        notificationService.notifyPayersNewRequest(
                savedRequest,
                payers
        );

        return toDto(savedRequest);
    }

    // ==========================================================
    // Get Provider Requests
    // ==========================================================

    @Override
    @Transactional(readOnly = true)
    public List<AuthRequestResponseDto> getMyRequests(
            Long providerId) {

        return requestRepository
                .findByProviderIdOrderByCreatedAtDesc(providerId)
                .stream()
                .map(this::toDto)
                .toList();
    }

    // ==========================================================
    // DTO Mapper
    // ==========================================================

    private AuthRequestResponseDto toDto(
            AuthorizationRequest request) {

        return new AuthRequestResponseDto(

                request.getId(),

                request.getPatientName(),

                request.getPatientId(),

                request.getInsuranceId(),

                request.getProvider().getFullName(),

                request.getProvider().getId(),

                request.getDiagnosisCode(),

                request.getProcedureCode(),

                request.getTreatmentDescription(),

                request.getAdmissionDate(),

                request.getExpectedDischargeDate(),

                request.getPriority(),

                request.getStatus(),

                request.getRejectionReason(),

                request.getReviewNotes(),

                request.getCreatedAt(),

                request.getReviewedAt()

        );
    }

}