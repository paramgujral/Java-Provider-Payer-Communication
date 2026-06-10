package com.feuji.healthcare_connector.repository;

import com.feuji.healthcare_connector.entity.AuthorizationRequest;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AuthorizationRequestRepository extends JpaRepository<AuthorizationRequest, Long> {
}