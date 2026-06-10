package com.example.demo.repository;

import com.example.demo.model.AuthorizationRequest;
import com.example.demo.model.RequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuthorizationRequestRepository
        extends JpaRepository<AuthorizationRequest, Long> {

    List<AuthorizationRequest> findByProviderId(Long providerId);

    List<AuthorizationRequest> findByPayerId(Long payerId);

    List<AuthorizationRequest> findByStatus(RequestStatus status);

    List<AuthorizationRequest> findByPayer_IdAndStatus(
            Long payerId,
            RequestStatus status
    );
}
