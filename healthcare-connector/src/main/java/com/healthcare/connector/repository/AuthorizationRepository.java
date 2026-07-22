package com.healthcare.connector.repository;

import com.healthcare.connector.entity.AuthorizationRequest;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AuthorizationRepository
        extends JpaRepository<AuthorizationRequest, Long> {
}