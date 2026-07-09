package com.healthconnect.repository;

import com.healthconnect.model.AuthorizationRequest;
import com.healthconnect.model.AuthorizationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface AuthorizationRequestRepository extends JpaRepository<AuthorizationRequest, Long> {

    Optional<AuthorizationRequest> findByFhirId(String fhirId);

    List<AuthorizationRequest> findByCreatedByUserId(Long userId);

    List<AuthorizationRequest> findByPayerOrgName(String payerOrgName);

    List<AuthorizationRequest> findByProviderOrgName(String providerOrgName);

    List<AuthorizationRequest> findByStatus(AuthorizationStatus status);

    List<AuthorizationRequest> findByPayerOrgNameAndStatus(String payerOrgName, AuthorizationStatus status);
}
