package com.feuji.healthcare.communication.service.impl;

import com.feuji.healthcare.authorization.entity.AuthorizationRequestEntity;
import com.feuji.healthcare.authorization.repository.AuthorizationRepository;
import com.feuji.healthcare.common.exception.ResourceNotFoundException;
import com.feuji.healthcare.communication.dto.CommunicationRequestDto;
import com.feuji.healthcare.communication.dto.CommunicationResponseDto;
import com.feuji.healthcare.communication.entity.CommunicationEntity;
import com.feuji.healthcare.communication.repository.CommunicationRepository;
import com.feuji.healthcare.communication.service.CommunicationService;
import com.feuji.healthcare.notification.enums.NotificationType;
import com.feuji.healthcare.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommunicationServiceImpl
        implements CommunicationService {

    private final CommunicationRepository communicationRepository;
    private final AuthorizationRepository authorizationRepository;
    private final NotificationService notificationService;

    @Override
    public CommunicationResponseDto addComment(
            CommunicationRequestDto request) {

        AuthorizationRequestEntity authorization =
                authorizationRepository.findById(
                                request.getAuthorizationId())
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Authorization Request Not Found"));

        CommunicationEntity communication =
                CommunicationEntity.builder()
                        .authorizationRequest(authorization)
                        .senderType(request.getSenderType())
                        .message(request.getMessage())
                        .build();

        CommunicationEntity savedCommunication =
                communicationRepository.save(communication);

        notificationService.createNotification(
                "New Communication",
                "New message added for Authorization Request : "
                        + authorization.getRequestNumber(),
                NotificationType.REQUEST_SUBMITTED
        );

        return mapToResponse(savedCommunication);
    }

    @Override
    public List<CommunicationResponseDto>
    getComments(Long authorizationId) {

        return communicationRepository
                .findByAuthorizationRequestId(authorizationId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private CommunicationResponseDto mapToResponse(
            CommunicationEntity entity) {

        return CommunicationResponseDto.builder()
                .id(entity.getId())
                .authorizationId(
                        entity.getAuthorizationRequest().getId())
                .senderType(entity.getSenderType())
                .message(entity.getMessage())
                .build();
    }
}