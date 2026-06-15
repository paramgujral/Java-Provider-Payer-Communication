package com.example.demo.ai_validation.controller;

import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.ai_validation.model.AIValidation;
import com.example.demo.ai_validation.repository.AIValidationRepository;

@RestController
@RequestMapping("/ai-validations")
public class AIValidationController {

    private final AIValidationRepository repository;

    public AIValidationController(AIValidationRepository repository) {
        this.repository = repository;
    }

    @GetMapping("/{claimId}")
    @ResponseStatus(HttpStatus.OK)
    public AIValidation getByClaimId(@PathVariable UUID claimId) {
        return repository.findById(claimId)
                .orElseThrow(() -> new RuntimeException("AIValidation not found for claimId=" + claimId));
    }
}
