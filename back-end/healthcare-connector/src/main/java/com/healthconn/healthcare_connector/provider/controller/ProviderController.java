package com.healthconn.healthcare_connector.provider.controller;

import com.healthconn.healthcare_connector.authentication.entity.User;
import com.healthconn.healthcare_connector.provider.dto.AuthRequestResponseDto;
import com.healthconn.healthcare_connector.provider.dto.SubmitRequestDto;
import com.healthconn.healthcare_connector.provider.dto.SuggestRequestDto;
import com.healthconn.healthcare_connector.provider.service.OpenAiService;
import com.healthconn.healthcare_connector.provider.service.ProviderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
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
@Tag(name = "Provider APIs")
public class ProviderController {

    private final ProviderService providerService;
    private final OpenAiService openAiService;

    // ==========================================================
    // Submit Authorization Request
    // ==========================================================

    @Operation(summary = "Submit a new authorization request")
    @PostMapping("/requests")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<AuthRequestResponseDto> submitRequest(

            @Valid
            @RequestBody SubmitRequestDto dto,

            @AuthenticationPrincipal User currentUser) {

        return ResponseEntity.ok(
                providerService.submitRequest(
                        dto,
                        currentUser.getId()
                )
        );
    }

    // ==========================================================
    // Get My Requests
    // ==========================================================

    @Operation(summary = "Get logged-in provider requests")
    @GetMapping("/requests")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<List<AuthRequestResponseDto>> getMyRequests(

            @AuthenticationPrincipal User currentUser) {

        return ResponseEntity.ok(
                providerService.getMyRequests(
                        currentUser.getId()
                )
        );
    }

    // ==========================================================
    // AI Suggestion
    // ==========================================================

    @Operation(summary = "Generate AI suggestion for a form field")
    @PostMapping("/suggest")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<Map<String, String>> suggest(

            @RequestBody SuggestRequestDto dto) {

        String suggestion = openAiService.getFieldSuggestion(

                dto.fieldName(),

                dto.fieldValue(),

                dto.diagnosisCode(),

                dto.procedureCode(),

                dto.treatmentDescription()

        );

        return ResponseEntity.ok(
                Map.of("suggestion", suggestion)
        );
    }

}