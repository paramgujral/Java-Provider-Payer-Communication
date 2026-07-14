package com.healthcare.authorization.repository;

import com.healthcare.authorization.entity.AuthorizationRequest;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AuthorizationRequestRepository extends JpaRepository<AuthorizationRequest, Long> {
    java.util.List<AuthorizationRequest> findByProviderId(Long providerId);
    java.util.List<AuthorizationRequest> findByPayerId(Long payerId);
}
