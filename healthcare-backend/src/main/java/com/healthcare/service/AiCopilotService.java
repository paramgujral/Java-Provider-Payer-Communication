package com.healthcare.service;

import com.healthcare.dto.AiReviewResponse;
import com.healthcare.entity.AuthorizationRequest;

import reactor.core.publisher.Mono;

public interface AiCopilotService {
    /**
     * Analyzes an authorization request and provides recommendations.
     * @param request the draft request
     * @return Mono of AI review response with suggestions
     */
    Mono<AiReviewResponse> analyzeRequest(AuthorizationRequest request);

    /**
     * Acts as a payer adjudicator to review an incoming request for medical necessity and fraud.
     * @param request the submitted request
     * @return Mono of AI review response with recommendations
     */
    Mono<AiReviewResponse> adjudicateRequest(AuthorizationRequest request);
}
