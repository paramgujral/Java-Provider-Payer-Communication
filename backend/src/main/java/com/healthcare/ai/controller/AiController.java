package com.healthcare.ai.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.healthcare.ai.dto.AiMissingFieldsRequest;
import com.healthcare.ai.dto.AiMissingFieldsResponse;
import com.healthcare.ai.dto.AiRecommendationRequest;
import com.healthcare.ai.dto.AiRecommendationResponse;
import com.healthcare.ai.dto.AiReviewRequest;
import com.healthcare.ai.dto.AiReviewResponse;
import com.healthcare.ai.dto.AiSummaryRequest;
import com.healthcare.ai.dto.AiSummaryResponse;
import com.healthcare.ai.dto.AiValidationRequest;
import com.healthcare.ai.dto.AiValidationResponse;
import com.healthcare.ai.service.AiCopilotService;
import com.healthcare.common.response.ApiResponse;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiController {

    private final AiCopilotService aiCopilotService;

    @PostMapping("/summarize")
    public ResponseEntity<ApiResponse<AiSummaryResponse>> summarize(@Valid @RequestBody AiSummaryRequest request) {
        return ResponseEntity.ok(ApiResponse.<AiSummaryResponse>builder()
                .success(true)
                .message("AI summary generated")
                .data(aiCopilotService.summarize(request))
                .build());
    }

    @PostMapping("/recommend")
    public ResponseEntity<ApiResponse<AiRecommendationResponse>> recommend(@Valid @RequestBody AiRecommendationRequest request) {
        return ResponseEntity.ok(ApiResponse.<AiRecommendationResponse>builder()
                .success(true)
                .message("AI recommendation generated")
                .data(aiCopilotService.recommend(request))
                .build());
    }

    @PostMapping("/validate")
    public ResponseEntity<ApiResponse<AiValidationResponse>> validate(@Valid @RequestBody AiValidationRequest request) {
        return ResponseEntity.ok(ApiResponse.<AiValidationResponse>builder()
                .success(true)
                .message("AI validation complete")
                .data(aiCopilotService.validate(request))
                .build());
    }

    @PostMapping("/review")
    public ResponseEntity<ApiResponse<AiReviewResponse>> review(@Valid @RequestBody AiReviewRequest request) {
        return ResponseEntity.ok(ApiResponse.<AiReviewResponse>builder()
                .success(true)
                .message("AI review complete")
                .data(aiCopilotService.review(request))
                .build());
    }

    @PostMapping("/missing-fields")
    public ResponseEntity<ApiResponse<AiMissingFieldsResponse>> detectMissingFields(@Valid @RequestBody AiMissingFieldsRequest request) {
        return ResponseEntity.ok(ApiResponse.<AiMissingFieldsResponse>builder()
                .success(true)
                .message("AI missing fields detected")
                .data(aiCopilotService.detectMissingFields(request))
                .build());
    }
}
