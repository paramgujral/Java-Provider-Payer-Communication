package com.connector.auth.service;

import com.connector.auth.domain.AuthorizationRequest;
import com.connector.auth.domain.CopilotReview;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

/**
 * Orchestrates the AI Copilot review. Prefers a live LLM when configured;
 * otherwise (or on any failure) uses the deterministic rules engine so the
 * platform is always functional.
 */
@Service
public class CopilotService {

    private static final Logger log = LoggerFactory.getLogger(CopilotService.class);

    private final AnthropicClient anthropicClient;
    private final RuleEngine ruleEngine;

    public CopilotService(AnthropicClient anthropicClient, RuleEngine ruleEngine) {
        this.anthropicClient = anthropicClient;
        this.ruleEngine = ruleEngine;
    }

    public CopilotReview review(AuthorizationRequest request) {
        CopilotReview review = null;
        if (anthropicClient.isConfigured()) {
            review = anthropicClient.review(request);
            if (review != null) log.debug("Copilot review produced by LLM");
        }
        if (review == null) {
            review = ruleEngine.review(request);
            log.debug("Copilot review produced by rules engine");
        }
        return review;
    }
}
