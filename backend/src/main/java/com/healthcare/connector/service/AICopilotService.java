package com.healthcare.connector.service;

import com.healthcare.connector.models.AiReview;
import com.healthcare.connector.models.AuthorizationRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@Slf4j
public class AICopilotService {

    public AiReview reviewRequest(AuthorizationRequest request) {
        List<String> issues = new ArrayList<>();
        List<String> suggestions = new ArrayList<>();
        int score = 100;

        // 1. Validate Patient ID
        if (request.getPatientId() == null || request.getPatientId().isEmpty()) {
            issues.add("Patient ID is missing.");
            suggestions.add("Provide a valid patient MRN or identifier.");
            score -= 25;
        }

        // 2. Validate Service Type
        if (request.getServiceType() == null || request.getServiceType().isEmpty()) {
            issues.add("Service type is not specified.");
            suggestions.add("Specify the requested service (e.g., MRI, Surgery, Lab Test).");
            score -= 20;
        }

        // 3. Validate Provider
        if (request.getProvider() == null || request.getProvider().getNpi() == null) {
            issues.add("Provider NPI is missing.");
            suggestions.add("Ensure the referring provider has a valid NPI.");
            score -= 20;
        }

        // 4. Validate Payer
        if (request.getPayer() == null) {
            issues.add("Payer organization is not selected.");
            suggestions.add("Select the correct insurance payer.");
            score -= 15;
        }

        // 5. Validate Date
        if (request.getRequestDate() == null || request.getRequestDate().isAfter(java.time.LocalDateTime.now())) {
            issues.add("Request date is invalid or in the future.");
            suggestions.add("Set the request date to today or a past date.");
            score -= 10;
        }

        // 6. Validate FHIR JSON completeness
        if (request.getFhirClaimJson() == null || request.getFhirClaimJson().length() < 50) {
            issues.add("FHIR Claim payload is incomplete or malformed.");
            suggestions.add("Regenerate the FHIR Claim with all required sections.");
            score -= 10;
        }

        score = Math.max(0, score);

        AiReview review = new AiReview();
        review.setScore(score);
        review.setIssues(String.join("; ", issues));
        review.setSuggestions(String.join("; ", suggestions));
        return review;
    }
}
