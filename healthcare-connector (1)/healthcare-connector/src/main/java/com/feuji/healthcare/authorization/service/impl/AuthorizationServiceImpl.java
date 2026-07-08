package com.feuji.healthcare.authorization.service.impl;

import com.feuji.healthcare.authorization.dto.ApprovalRequestDto;
import com.feuji.healthcare.authorization.dto.AuthorizationRequestDto;
import com.feuji.healthcare.authorization.dto.AuthorizationResponseDto;
import com.feuji.healthcare.authorization.entity.AuthorizationRequestEntity;
import com.feuji.healthcare.authorization.enums.AuthorizationStatus;
import com.feuji.healthcare.authorization.repository.AuthorizationRepository;
import com.feuji.healthcare.authorization.service.AuthorizationService;
import com.feuji.healthcare.common.exception.BadRequestException;
import com.feuji.healthcare.common.exception.ResourceNotFoundException;
import com.feuji.healthcare.communication.entity.CommunicationEntity;
import com.feuji.healthcare.communication.enums.CommunicationType;
import com.feuji.healthcare.communication.repository.CommunicationRepository;
import com.feuji.healthcare.notification.service.NotificationService;
import com.feuji.healthcare.patient.entity.PatientEntity;
import com.feuji.healthcare.patient.repository.PatientRepository;
import com.feuji.healthcare.payer.entity.PayerEntity;
import com.feuji.healthcare.payer.repository.PayerRepository;
import com.feuji.healthcare.provider.entity.ProviderEntity;
import com.feuji.healthcare.provider.repository.ProviderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.feuji.healthcare.notification.enums.NotificationType;
import com.feuji.healthcare.notification.service.NotificationService;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthorizationServiceImpl
        implements AuthorizationService {

    private final AuthorizationRepository authorizationRepository;
    private final ProviderRepository providerRepository;
    private final PayerRepository payerRepository;
    private final PatientRepository patientRepository;
    private final NotificationService notificationService;
    private final CommunicationRepository communicationRepository;

    @Override
    public AuthorizationResponseDto createRequest(
            AuthorizationRequestDto request) {

        ProviderEntity provider =
                providerRepository.findById(
                                request.getProviderId())
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Provider not found"));

        PayerEntity payer =
                payerRepository.findById(
                                request.getPayerId())
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Payer not found"));

        PatientEntity patient =
                patientRepository.findById(
                                request.getPatientId())
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Patient not found"));

        validateRequest(request);

        String requestNumber =
                "AUTH-" + System.currentTimeMillis();

        AuthorizationRequestEntity entity =
                AuthorizationRequestEntity.builder()
                        .requestNumber(requestNumber)
                        .provider(provider)
                        .payer(payer)
                        .patient(patient)
                        .diagnosis(request.getDiagnosis())
                        .procedureCode(request.getProcedureCode())
                        .requestedAmount(request.getRequestedAmount())
                        .status(AuthorizationStatus.SUBMITTED)
                        .build();

        AuthorizationRequestEntity savedEntity =
                authorizationRepository.save(entity);

        notificationService.createNotification(
                "Authorization Submitted",
                "Request " + requestNumber + " submitted successfully",
                NotificationType.REQUEST_SUBMITTED);

        return mapToResponse(savedEntity);
    }

    @Override
    public List<AuthorizationResponseDto> getAllRequests() {

        return authorizationRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public AuthorizationResponseDto getRequestById(Long id) {

        AuthorizationRequestEntity entity =
                authorizationRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Authorization Request Not Found"));

        return mapToResponse(entity);
    }

    private void validateRequest(
            AuthorizationRequestDto request) {

        if (request.getDiagnosis() == null ||
                request.getDiagnosis().isBlank()) {

            throw new BadRequestException(
                    "AI Recommendation: Diagnosis information is missing.");
        }

        if (request.getProcedureCode() == null ||
                request.getProcedureCode().isBlank()) {

            throw new BadRequestException(
                    "AI Recommendation: Procedure Code is required.");
        }

        if (request.getRequestedAmount() == null ||
                request.getRequestedAmount().doubleValue() <= 0) {

            throw new BadRequestException(
                    "AI Recommendation: Requested amount must be greater than zero.");
        }
    }

    private AuthorizationResponseDto mapToResponse(
            AuthorizationRequestEntity entity) {

        return AuthorizationResponseDto.builder()
                .id(entity.getId())
                .requestNumber(entity.getRequestNumber())
                .providerName(
                        entity.getProvider().getProviderName())
                .payerName(
                        entity.getPayer().getPayerName())
                .patientName(
                        entity.getPatient().getFirstName()
                                + " "
                                + entity.getPatient().getLastName())
                .diagnosis(entity.getDiagnosis())
                .procedureCode(entity.getProcedureCode())
                .requestedAmount(entity.getRequestedAmount())
                .status(entity.getStatus())
                .rejectionReason(entity.getRejectionReason())
                .build();
    }

    @Override
    public AuthorizationResponseDto markUnderReview(Long id) {

        AuthorizationRequestEntity entity =
                authorizationRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Authorization Request Not Found"));

        entity.setStatus(
                AuthorizationStatus.UNDER_REVIEW);

        return mapToResponse(
                authorizationRepository.save(entity));
    }

    @Override
    public AuthorizationResponseDto approveRequest(
            Long id) {

        AuthorizationRequestEntity entity =
                authorizationRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Authorization Request Not Found"));

        entity.setStatus(
                AuthorizationStatus.APPROVED);

        AuthorizationRequestEntity updatedEntity =
                authorizationRepository.save(entity);

        notificationService.createNotification(
                "Authorization Approved",
                "Request "
                        + entity.getRequestNumber()
                        + " approved successfully",
                NotificationType.REQUEST_APPROVED);

        return mapToResponse(updatedEntity);
    }

    @Override
    public AuthorizationResponseDto rejectRequest(
            Long id,
            ApprovalRequestDto request) {

        AuthorizationRequestEntity entity =
                authorizationRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Authorization Request Not Found"));

        entity.setStatus(
                AuthorizationStatus.REJECTED);

        entity.setRejectionReason(
                request.getRejectionReason());

        AuthorizationRequestEntity updatedEntity =
                authorizationRepository.save(entity);

        notificationService.createNotification(
                "Authorization Rejected",
                "Request "
                        + entity.getRequestNumber()
                        + " rejected. Reason: "
                        + request.getRejectionReason(),
                NotificationType.REQUEST_REJECTED);

        return mapToResponse(updatedEntity);
    }

    @Override
    public AuthorizationResponseDto requestClarification(
            Long authorizationId,
            String message) {

        AuthorizationRequestEntity authorization =
                authorizationRepository.findById(
                                authorizationId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Authorization Request Not Found"));

        authorization.setStatus(
                AuthorizationStatus.CLARIFICATION_REQUIRED);

        authorizationRepository.save(authorization);

        CommunicationEntity communication =
                CommunicationEntity.builder()
                        .authorizationRequest(authorization)
                        .senderType(
                                CommunicationType.PAYER)
                        .message(message)
                        .build();

        communicationRepository.save(
                communication);

        notificationService.createNotification(
                "Clarification Requested",
                "Payer requested clarification for "
                        + authorization.getRequestNumber(),
                NotificationType.REQUEST_SUBMITTED);

        return mapToResponse(
                authorization);
    }

    @Override
    public AuthorizationResponseDto provideClarification(
            Long authorizationId,
            String response) {

        AuthorizationRequestEntity authorization =
                authorizationRepository.findById(
                                authorizationId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Authorization Request Not Found"));

        authorization.setStatus(
                AuthorizationStatus.CLARIFICATION_PROVIDED);

        authorizationRepository.save(
                authorization);

        CommunicationEntity communication =
                CommunicationEntity.builder()
                        .authorizationRequest(
                                authorization)
                        .senderType(
                                CommunicationType.PROVIDER)
                        .message(response)
                        .build();

        communicationRepository.save(
                communication);

        notificationService.createNotification(
                "Clarification Provided",
                "Provider responded for "
                        + authorization.getRequestNumber(),
                NotificationType.REQUEST_SUBMITTED);

        return mapToResponse(
                authorization);
    }
}