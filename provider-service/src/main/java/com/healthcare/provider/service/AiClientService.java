package com.healthcare.provider.service;

import com.healthcare.provider.dto.AiReviewRequest;
import com.healthcare.provider.dto.AiReviewResponse;
import com.healthcare.provider.entity.AuthorizationRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
@RequiredArgsConstructor
public class AiClientService {

    private final RestTemplate restTemplate;

    public String reviewRequest(
            AuthorizationRequest request) {

        AiReviewRequest aiRequest =
                new AiReviewRequest();

        aiRequest.setPatientName(
                request.getPatientName());

        aiRequest.setInsuranceId(
                request.getInsuranceId());

        aiRequest.setDiagnosisCode(
                request.getDiagnosisCode());

        aiRequest.setProcedureCode(
                request.getProcedureCode());

        aiRequest.setClinicalNotes(
                request.getClinicalNotes());

        AiReviewResponse response =
                restTemplate.postForObject(
                        "http://localhost:8082/ai/review",
                        aiRequest,
                        AiReviewResponse.class);

        return response.getRecommendation();
    }
}