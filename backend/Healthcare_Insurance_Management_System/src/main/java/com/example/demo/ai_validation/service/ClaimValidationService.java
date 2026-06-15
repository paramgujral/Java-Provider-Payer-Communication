package com.example.demo.ai_validation.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.ai_validation.model.AIValidation;
import com.example.demo.ai_validation.model.ClaimReview;
import com.example.demo.health_care.model.Disease;
import com.example.demo.insurance.model.Claim;
import com.example.demo.insurance.model.ClaimDocument;
import com.example.demo.insurance.model.InsurancePolicy;
import com.example.demo.ai_validation.utils.ReviewDecision;

@Service
public class ClaimValidationService {

    @Transactional
    public AIValidation validateAndPersist(
            Claim claim,
            InsurancePolicy policy,
            Disease disease,
            BigDecimal requestedAmount,
            List<ClaimDocument> documents) {

        AIValidation result = null;


        boolean policyExists = policy != null;
        boolean policyActive = false;
        if (policy != null) {
            LocalDate now = LocalDate.now();
            LocalDate start = policy.getStartDate();
            LocalDate end = policy.getEndDate();
            boolean hasStartEnd = start != null && end != null;
            if (!hasStartEnd) {
                policyActive = true; // demo-friendly
            } else {
                policyActive = (now.isEqual(start) || now.isAfter(start)) && (now.isEqual(end) || now.isBefore(end));
            }
        }

        BigDecimal coverageAmount = policy != null ? policy.getCoverageAmount() : null;
        boolean amountLessThanCoverage = policyExists && coverageAmount != null && requestedAmount != null
                && requestedAmount.compareTo(coverageAmount) < 1; // <=

        boolean diseaseSelected = disease != null && disease.getId() != null;
        boolean docsUploaded = documents != null && !documents.isEmpty();

        int score = 0;
        if (policyExists) score += 25;
        if (policyActive) score += 25;
        if (amountLessThanCoverage) score += 20;
        if (diseaseSelected) score += 15;
        if (docsUploaded) score += 15;

        // Documents are OPTIONAL: they influence score but do not block validity.
        boolean allOk = policyExists && policyActive && amountLessThanCoverage && diseaseSelected;

        String finalResult = allOk ? "VALID" : "INVALID";
        String finalRemarks = buildRemarks(policyExists, policyActive, amountLessThanCoverage, diseaseSelected, docsUploaded);

        AIValidation validation = AIValidation.builder()

                .score(score)
                .result(finalResult)
                .remarks(finalRemarks)

                .validatedAt(LocalDateTime.now())
                .claim(claim)
                .build();

        return validation;
    }

    private String buildRemarks(boolean policyExists, boolean policyActive, boolean amountLessThanCoverage,
                                 boolean diseaseSelected, boolean docsUploaded) {
        StringBuilder sb = new StringBuilder();
        if (!policyExists) sb.append("Policy not found. ");
        else if (!policyActive) sb.append("Policy is not active. ");

        if (!amountLessThanCoverage) sb.append("Requested amount exceeds coverage. ");
        if (!diseaseSelected) sb.append("Disease not selected. ");
        // Documents are optional; do not invalidate if not present.

        String remarks = sb.toString().trim();
        return remarks.isEmpty() ? "All checks passed." : remarks;
    }

    public static class ValidationInput {
        public Claim claim;
        public InsurancePolicy policy;
        public Disease disease;
        public BigDecimal requestedAmount;
        public List<ClaimDocument> documents;
    }

    // Holder used internally to keep logic simple.
}

