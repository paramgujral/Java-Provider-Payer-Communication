package com.feuji.healthcare.ai.controller;

import com.feuji.healthcare.ai.dto.AiValidationResponseDto;
import com.feuji.healthcare.ai.service.AiCopilotService;
import com.feuji.healthcare.authorization.dto.AuthorizationRequestDto;
import com.feuji.healthcare.common.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/ai")
@RequiredArgsConstructor
public class AiCopilotController {

    private final AiCopilotService aiCopilotService;

    @PostMapping("/validate")
    @PreAuthorize("hasAnyRole('ADMIN','PROVIDER')")
    public ResponseEntity<ApiResponse<AiValidationResponseDto>>
    validateRequest(
            @RequestBody AuthorizationRequestDto request) {

        return ResponseEntity.ok(
                ApiResponse.<AiValidationResponseDto>builder()
                        .success(true)
                        .message("AI Validation Completed")
                        .data(
                                aiCopilotService
                                        .validateAuthorizationRequest(
                                                request))
                        .build()
        );
    }
}