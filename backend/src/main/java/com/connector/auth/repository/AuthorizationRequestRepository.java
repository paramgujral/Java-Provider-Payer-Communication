package com.connector.auth.repository;

import com.connector.auth.domain.AuthorizationRequest;
import com.connector.auth.domain.RequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AuthorizationRequestRepository extends JpaRepository<AuthorizationRequest, Long> {
    List<AuthorizationRequest> findByStatusInOrderByCreatedAtDesc(List<RequestStatus> statuses);
    List<AuthorizationRequest> findAllByOrderByCreatedAtDesc();
    boolean existsByReference(String reference);
}
