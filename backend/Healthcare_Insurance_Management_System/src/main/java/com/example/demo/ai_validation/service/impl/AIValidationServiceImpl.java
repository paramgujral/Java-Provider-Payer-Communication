package com.example.demo.ai_validation.service.impl;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.ai_validation.model.AIValidation;
import com.example.demo.ai_validation.model.ClaimReview;
import com.example.demo.ai_validation.repository.AIValidationRepository;
import com.example.demo.ai_validation.service.AIValidationService;
import com.example.demo.ai_validation.utils.ReviewDecision;
import com.example.demo.health_care.model.Disease;
import com.example.demo.insurance.model.Claim;
import com.example.demo.insurance.model.ClaimDocument;
import com.example.demo.insurance.model.InsurancePolicy;

@Service
public class AIValidationServiceImpl implements AIValidationService {

	private final AIValidationRepository repository;

	public AIValidationServiceImpl(AIValidationRepository repository) {
		this.repository = repository;
	}

	@Override
	@Transactional
	public AIValidation validateAndPersist(
			Claim claim,
			InsurancePolicy policy,
			Disease disease,
			BigDecimal requestedAmount,
			List<ClaimDocument> documents) {

		boolean policyExists = policy != null;
		boolean policyActive = false;
		if (policy != null) {
			LocalDate start = policy.getStartDate();
			LocalDate end = policy.getEndDate();
			boolean hasStartEnd = start != null && end != null;
			if (!hasStartEnd) {
				policyActive = true;
			} else {
				LocalDate now = LocalDate.now();
				policyActive = (now.isEqual(start) || now.isAfter(start)) && (now.isEqual(end) || now.isBefore(end));
			}
		}

		BigDecimal coverageAmount = policy != null ? policy.getCoverageAmount() : null;
		boolean amountLessThanCoverage = policyExists && coverageAmount != null && requestedAmount != null
				&& requestedAmount.compareTo(coverageAmount) <= 0;

		boolean diseaseSelected = disease != null && disease.getId() != null;
		boolean docsUploaded = documents != null && !documents.isEmpty();

		int score = 0;
		if (policyExists) score += 25;
		if (policyActive) score += 25;
		if (amountLessThanCoverage) score += 20;
		if (diseaseSelected) score += 15;
		if (docsUploaded) score += 15;

		boolean allOk = policyExists && policyActive && amountLessThanCoverage && diseaseSelected;
		String result = allOk ? "VALID" : "INVALID";
		String remarks = buildRemarks(policyExists, policyActive, amountLessThanCoverage, diseaseSelected, docsUploaded);

		AIValidation validation = AIValidation.builder()
				.score(score)
				.result(result)
				.remarks(remarks)
				.validatedAt(LocalDateTime.now())
				.claim(claim)
				.build();

		return repository.save(validation);
	}

	private String buildRemarks(boolean policyExists, boolean policyActive, boolean amountLessThanCoverage,
			boolean diseaseSelected, boolean docsUploaded) {
		StringBuilder sb = new StringBuilder();
		if (!policyExists) sb.append("Policy not found. ");
		else if (!policyActive) sb.append("Policy is not active. ");
		if (!amountLessThanCoverage) sb.append("Requested amount exceeds coverage. ");
		if (!diseaseSelected) sb.append("Disease not selected. ");
		String remarks = sb.toString().trim();
		return remarks.isEmpty() ? "All checks passed." : remarks;
	}
}
