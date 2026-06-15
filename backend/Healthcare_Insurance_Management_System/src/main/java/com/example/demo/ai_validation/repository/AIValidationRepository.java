package com.example.demo.ai_validation.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.ai_validation.model.AIValidation;

public interface AIValidationRepository extends JpaRepository<AIValidation, UUID> {

	Optional<AIValidation> findByClaimId(UUID claimId);
}
