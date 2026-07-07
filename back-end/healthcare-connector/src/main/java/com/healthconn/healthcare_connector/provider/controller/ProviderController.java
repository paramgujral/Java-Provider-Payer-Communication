package com.healthconn.healthcare_connector.provider.controller;

import com.healthconn.healthcare_connector.authentication.entity.User;
import com.healthconn.healthcare_connector.provider.dto.AuthRequestResponseDto;
import com.healthconn.healthcare_connector.provider.dto.SubmitRequestDto;
import com.healthconn.healthcare_connector.provider.dto.SuggestRequestDto;
import com.healthconn.healthcare_connector.provider.service.OpenAiService;
import com.healthconn.healthcare_connector.provider.service.ProviderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/provider")
@RequiredArgsConstructor
public class ProviderController {

    private final ProviderService providerService;
    private final OpenAiService   openAiService;

    @PostMapping("/requests")
    public ResponseEntity<AuthRequestResponseDto> submitRequest(
            @Valid @RequestBody SubmitRequestDto dto,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(
                providerService.submitRequest(dto, currentUser.getId()));
    }

    @GetMapping("/requests")
    public ResponseEntity<List<AuthRequestResponseDto>> getMyRequests(
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(
                providerService.getMyRequests(currentUser.getId()));
    }

    /**
     * Returns a focused 1-sentence AI suggestion for a single form field.
     * Called on blur of each field in the frontend.
     */
    @PostMapping("/suggest")
    public ResponseEntity<Map<String, String>> suggest(
            @RequestBody SuggestRequestDto dto) {
        String suggestion = openAiService.getFieldSuggestion(
                dto.fieldName(),
                dto.fieldValue(),
                dto.diagnosisCode(),
                dto.procedureCode(),
                dto.treatmentDescription()
        );
        return ResponseEntity.ok(Map.of("suggestion", suggestion));
    }
}