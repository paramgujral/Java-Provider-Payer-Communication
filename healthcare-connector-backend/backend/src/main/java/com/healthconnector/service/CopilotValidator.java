package com.healthconnector.service;

import com.healthconnector.model.AuthorizationRequest;
import com.healthconnector.dto.ValidationResultDto;

/**
 * Abstraction for the "AI Copilot" that reviews a request before submission.
 * Implemented today by RuleBasedCopilotValidator. Swap in an
 * LlmCopilotValidator later (e.g. calling Claude via the Anthropic API) by
 * implementing this same interface and wiring it in place of the rule-based
 * bean - no controller/service changes required elsewhere.
 */
public interface CopilotValidator {
    ValidationResultDto validate(AuthorizationRequest request);
}
