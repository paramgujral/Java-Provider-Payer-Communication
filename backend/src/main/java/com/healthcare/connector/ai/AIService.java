package com.healthcare.connector.ai;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.healthcare.connector.dto.AIReviewResponse;
import com.healthcare.connector.dto.AuthorizationRequestDto;
@Service
public class AIService {

    public AIReviewResponse validateRequest(AuthorizationRequestDto request) {

        AIReviewResponse response = new AIReviewResponse();

        List<String> missingFields = new ArrayList<>();
        List<String> recommendations = new ArrayList<>();

        int score = 100;

        if (request.getInsuranceId() == null ||
            request.getInsuranceId().trim().isEmpty()) {

            missingFields.add("Insurance ID");
            score -= 20;
        }

        if (request.getDiagnosis() == null ||
            request.getDiagnosis().trim().isEmpty()) {

            missingFields.add("Diagnosis");
            score -= 20;
        }

        if (request.getClinicalNotes() == null ||
            request.getClinicalNotes().trim().isEmpty()) {

            missingFields.add("Clinical Notes");
            score -= 20;
        }

        if (request.getEstimatedCost() == null) {
            missingFields.add("Estimated Cost");
            score -= 20;
        }

        response.setCompletenessScore(score);
        response.setMissingFields(missingFields);

        if (!missingFields.isEmpty()) {
            recommendations.add(
                "Please complete all mandatory fields before submission."
            );
        } else {
            recommendations.add("Request is valid.");
        }

        response.setRecommendations(recommendations);

        return response;
    }
}
