package com.healthcare.provider.repository;

import com.healthcare.provider.entity.AuthorizationRequest;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AuthorizationRepository
        extends JpaRepository<AuthorizationRequest, Long> {
}