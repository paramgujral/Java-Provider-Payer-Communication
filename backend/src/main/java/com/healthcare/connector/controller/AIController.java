package com.healthcare.connector.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.healthcare.connector.ai.AIService;
import com.healthcare.connector.dto.AIReviewResponse;
import com.healthcare.connector.dto.AuthorizationRequestDto;
import com.healthcare.connector.service.AuthorizationRequestService;
@RestController
@RequestMapping("/api/requests")
public class AIController {

    private final AuthorizationRequestService requestService;
    private final AIService aiService;

    public AIController(
            AuthorizationRequestService requestService,
            AIService aiService) {

        this.requestService = requestService;
        this.aiService = aiService;
    }

    @PostMapping("/add")
    public ResponseEntity<?> createRequest(
            @RequestBody AuthorizationRequestDto requestDto) {

        AIReviewResponse aiResponse =
                aiService.validateRequest(requestDto);

        if (!aiResponse.getMissingFields().isEmpty()) {

            return ResponseEntity.badRequest().body(aiResponse);
        }

        AuthorizationRequestDto savedRequest =
                requestService.createRequest(requestDto);

        return ResponseEntity.ok(savedRequest);
    }
}
