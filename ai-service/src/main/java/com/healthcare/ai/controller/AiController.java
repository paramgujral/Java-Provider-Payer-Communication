package com.healthcare.ai.controller;

import com.healthcare.ai.dto.AiReviewResponse;
import com.healthcare.ai.dto.AuthorizationReviewRequest;
import com.healthcare.ai.service.GeminiService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/ai")
@RequiredArgsConstructor
public class AiController {

    private final GeminiService geminiService;

    @PostMapping("/review")
    public AiReviewResponse review(
            @RequestBody AuthorizationReviewRequest request) {

        String requestData =
                """
                Patient Name: %s
                Insurance ID: %s
                Diagnosis Code: %s
                Procedure Code: %s
                Clinical Notes: %s
                """
                        .formatted(
                                request.getPatientName(),
                                request.getInsuranceId(),
                                request.getDiagnosisCode(),
                                request.getProcedureCode(),
                                request.getClinicalNotes());

        String recommendation =
                geminiService.reviewRequest(
                        requestData);

        return new AiReviewResponse(
                recommendation);
    }
}