package com.healthcare.connector.repository;

import com.healthcare.connector.entity.AuthorizationRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
@Repository
public interface AuthorizationRequestRepository extends JpaRepository<AuthorizationRequest, Long> {
    List<AuthorizationRequest> findByProviderId(Long providerId);
    List<AuthorizationRequest> findByPayerId(Long payerId);
	List<AuthorizationRequest> findByRequestId(Long requestId);
}
