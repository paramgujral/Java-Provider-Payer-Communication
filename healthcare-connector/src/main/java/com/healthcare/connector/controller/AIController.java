package com.healthcare.connector.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.healthcare.connector.entity.AuthorizationRequest;
import com.healthcare.connector.service.AIService;
import com.healthcare.connector.service.GeminiService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/copilot")
@CrossOrigin(origins = "http://localhost:4200")
public class AIController {

    private final AIService aiService;
    private final GeminiService geminiService;

    public AIController(AIService aiService,
                        GeminiService geminiService) {

        this.aiService = aiService;
        this.geminiService = geminiService;
    }

    @PostMapping("/review")
    public String review(@RequestBody AuthorizationRequest request) throws JsonProcessingException {

        return geminiService.reviewRequest(request);

    }
}