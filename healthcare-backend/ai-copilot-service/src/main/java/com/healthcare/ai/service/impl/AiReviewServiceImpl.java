package com.healthcare.ai.service.impl;

import com.healthcare.ai.entity.AiReview;
import com.healthcare.ai.exception.ResourceNotFoundException;
import com.healthcare.ai.repository.AiReviewRepository;
import com.healthcare.ai.service.AiReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class AiReviewServiceImpl implements AiReviewService {
    private final AiReviewRepository repository;

    public AiReview review(Map<String, String> request) {
        List<String> recommendations = new ArrayList<>();
        if (isBlank(request.get("patientId"))) recommendations.add("Patient ID is missing");
        if (isBlank(request.get("procedureCode"))) recommendations.add("Procedure code is missing");
        if (isBlank(request.get("diagnosisCode"))) recommendations.add("Diagnosis code is missing");
        if (isBlank(request.get("clinicalNotes"))) recommendations.add("Clinical notes are missing");
        if (isBlank(request.get("payerId"))) recommendations.add("Payer ID is missing");

        AiReview review = AiReview.builder()
                .authorizationId(parseLong(request.get("authorizationId")))
                .validRequest(recommendations.isEmpty())
                .recommendations(recommendations.isEmpty() ? "Request is valid" : String.join(", ", recommendations))
                .reviewedAt(LocalDateTime.now())
                .build();
        return repository.save(review);
    }

    public AiReview getById(Long id) {
        return repository.findById(id).orElseThrow(() -> new ResourceNotFoundException("AI review not found: " + id));
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }

    private Long parseLong(String value) {
        try {
            return value == null ? null : Long.parseLong(value);
        } catch (NumberFormatException ex) {
            return null;
        }
    }
}
