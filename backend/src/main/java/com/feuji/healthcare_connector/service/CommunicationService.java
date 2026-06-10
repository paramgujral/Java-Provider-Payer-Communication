package com.feuji.healthcare_connector.service;

import com.feuji.healthcare_connector.entity.AuthorizationCommunication;
import com.feuji.healthcare_connector.repository.AuthorizationCommunicationRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class CommunicationService {

    private final AuthorizationCommunicationRepository repository;

    public CommunicationService(AuthorizationCommunicationRepository repository) {
        this.repository = repository;
    }

    public void log(
            Long authorizationRequestId,
            String fromRole,
            String toRole,
            String eventType,
            String message
    ) {
        AuthorizationCommunication communication = new AuthorizationCommunication();

        communication.authorizationRequestId = authorizationRequestId;
        communication.fromRole = fromRole;
        communication.toRole = toRole;
        communication.eventType = eventType;
        communication.message = message;
        communication.createdAt = LocalDateTime.now();

        repository.save(communication);
    }

    public List<AuthorizationCommunication> getAll() {
        return repository.findAllByOrderByCreatedAtDesc();
    }

    public List<AuthorizationCommunication> getByRequestId(Long requestId) {
        return repository.findByAuthorizationRequestIdOrderByCreatedAtDesc(requestId);
    }
}