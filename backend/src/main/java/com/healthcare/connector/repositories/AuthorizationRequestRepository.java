package com.healthcare.connector.repositories;

import com.healthcare.connector.enums.RequestStatus;
import com.healthcare.connector.models.AuthorizationRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AuthorizationRequestRepository extends JpaRepository<AuthorizationRequest, Long> {
    List<AuthorizationRequest> findByProviderId(Long providerId);
    List<AuthorizationRequest> findByPayerId(Long payerId);
    List<AuthorizationRequest> findByPayerIdAndStatus(Long payerId, RequestStatus status);
}
