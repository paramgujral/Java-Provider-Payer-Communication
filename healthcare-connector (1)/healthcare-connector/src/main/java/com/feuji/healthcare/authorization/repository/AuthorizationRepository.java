package com.feuji.healthcare.authorization.repository;

import com.feuji.healthcare.authorization.entity.AuthorizationRequestEntity;
import com.feuji.healthcare.authorization.enums.AuthorizationStatus;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AuthorizationRepository
        extends JpaRepository<AuthorizationRequestEntity, Long> {

    long countByStatus(AuthorizationStatus status);
}