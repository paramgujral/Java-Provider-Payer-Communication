package com.feuji.healthcare.ai.service;

import com.feuji.healthcare.ai.dto.AiValidationResponseDto;
import com.feuji.healthcare.authorization.dto.AuthorizationRequestDto;

public interface AiCopilotService {

    AiValidationResponseDto validateAuthorizationRequest(
            AuthorizationRequestDto request);
}