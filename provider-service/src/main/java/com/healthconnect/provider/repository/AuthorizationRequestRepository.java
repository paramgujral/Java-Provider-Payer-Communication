package com.healthconnect.provider.repository;

import com.healthconnect.common.model.AuthorizationStatus;
import com.healthconnect.provider.domain.AuthorizationRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AuthorizationRequestRepository extends JpaRepository<AuthorizationRequest, Long> {

    Optional<AuthorizationRequest> findByRequestNumber(String requestNumber);

    List<AuthorizationRequest> findByStatusOrderByUpdatedAtDesc(AuthorizationStatus status);

    List<AuthorizationRequest> findAllByOrderByUpdatedAtDesc();
}
