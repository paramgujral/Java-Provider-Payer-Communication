package com.example.demo.ai_validation.service;

import java.math.BigDecimal;
import java.util.List;

import com.example.demo.ai_validation.model.AIValidation;
import com.example.demo.insurance.model.Claim;
import com.example.demo.insurance.model.ClaimDocument;
import com.example.demo.insurance.model.InsurancePolicy;
import com.example.demo.health_care.model.Disease;

public interface AIValidationService {

	AIValidation validateAndPersist(
			Claim claim,
			InsurancePolicy policy,
			Disease disease,
			BigDecimal requestedAmount,
			List<ClaimDocument> documents);
}
