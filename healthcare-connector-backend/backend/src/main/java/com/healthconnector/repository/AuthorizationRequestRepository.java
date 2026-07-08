package com.healthconnector.repository;

import com.healthconnector.model.AuthorizationRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AuthorizationRequestRepository extends JpaRepository<AuthorizationRequest, Long> {
    List<AuthorizationRequest> findByProviderUsername(String providerUsername);
}
