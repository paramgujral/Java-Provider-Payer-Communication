package com.healthcare.connector.repositories;

import com.healthcare.connector.models.AuthorizationResponse;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AuthorizationResponseRepository extends JpaRepository<AuthorizationResponse, Long> {
}