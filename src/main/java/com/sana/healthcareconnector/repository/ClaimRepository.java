package com.sana.healthcareconnector.repository;

import com.sana.healthcareconnector.entity.ClaimEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ClaimRepository
        extends JpaRepository<ClaimEntity, Long> {
}