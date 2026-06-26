package com.connector.fhir.controller;

import com.connector.fhir.dto.AIReviewResultDto;
import com.connector.fhir.dto.AuthorizationRequestDto;
import com.connector.fhir.service.AIService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
public class AIController {

    private final AIService aiService;

    public AIController(AIService aiService) {
        this.aiService = aiService;
    }

    @PostMapping("/review")
    public ResponseEntity<AIReviewResultDto> review(@Valid @RequestBody AuthorizationRequestDto dto) {
        AIReviewResultDto result = aiService.analyzeRequest(dto);
        return ResponseEntity.ok(result);
    }
}
