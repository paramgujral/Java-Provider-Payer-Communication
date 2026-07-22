package com.healthconn.healthcare_connector.provider.controller;

import com.healthconn.healthcare_connector.authentication.entity.User;
import com.healthconn.healthcare_connector.fhir.FhirMapper;
import com.healthconn.healthcare_connector.fhir.FhirMediaTypes;
import com.healthconn.healthcare_connector.provider.dto.AiReviewRequestDto;
import com.healthconn.healthcare_connector.provider.dto.AiReviewResponseDto;
import com.healthconn.healthcare_connector.provider.dto.AuthRequestResponseDto;
import com.healthconn.healthcare_connector.provider.dto.SubmitRequestDto;
import com.healthconn.healthcare_connector.provider.dto.SuggestRequestDto;
import com.healthconn.healthcare_connector.provider.service.AiReviewService;
import com.healthconn.healthcare_connector.provider.service.FieldSuggestionService;
import com.healthconn.healthcare_connector.provider.service.ProviderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * FHIR ServiceRequest + $suggest + $ai-review for provider workflow.
 */
@RestController
@RequestMapping(produces = {FhirMediaTypes.FHIR_JSON, FhirMediaTypes.JSON})
@RequiredArgsConstructor
public class ProviderController {

    private final ProviderService providerService;
    private final FieldSuggestionService fieldSuggestionService;
    private final AiReviewService aiReviewService;
    private final FhirMapper fhirMapper;

    @PostMapping(value = "/fhir/ServiceRequest",
            consumes = {FhirMediaTypes.FHIR_JSON, FhirMediaTypes.JSON})
    public ResponseEntity<Map<String, Object>> createAuthorizationRequest(
            @RequestBody Map<String, Object> serviceRequest,
            @AuthenticationPrincipal User currentUser) {
        SubmitRequestDto dto = fhirMapper.toSubmitRequest(serviceRequest);
        AuthRequestResponseDto created =
                providerService.createAuthorizationRequest(dto, currentUser.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(fhirMapper.toServiceRequest(created));
    }

    @GetMapping("/fhir/ServiceRequest")
    public ResponseEntity<Map<String, Object>> getProviderRequests(
            @AuthenticationPrincipal User currentUser) {
        List<AuthRequestResponseDto> requests =
                providerService.getProviderRequests(currentUser.getId());
        List<Map<String, Object>> entries = new ArrayList<Map<String, Object>>();
        for (AuthRequestResponseDto request : requests) {
            entries.add(fhirMapper.toServiceRequest(request));
        }
        return ResponseEntity.ok(fhirMapper.toBundle("searchset", entries));
    }

    @GetMapping("/fhir/ServiceRequest/{id}")
    public ResponseEntity<Map<String, Object>> getProviderRequestById(
            @PathVariable("id") Long id,
            @AuthenticationPrincipal User currentUser) {
        List<AuthRequestResponseDto> requests =
                providerService.getProviderRequests(currentUser.getId());
        for (AuthRequestResponseDto request : requests) {
            if (id.equals(request.getId())) {
                return ResponseEntity.ok(fhirMapper.toServiceRequest(request));
            }
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping(value = "/fhir/$suggest",
            consumes = {FhirMediaTypes.FHIR_JSON, FhirMediaTypes.JSON})
    public ResponseEntity<Map<String, Object>> generateFieldSuggestion(
            @RequestBody Map<String, Object> parameters) {
        SuggestRequestDto dto = fhirMapper.toSuggestRequest(parameters);
        String suggestion = fieldSuggestionService.getFieldSuggestion(
                dto.getFieldName(),
                dto.getFieldValue(),
                dto.getDiagnosisCode(),
                dto.getProcedureCode(),
                dto.getTreatmentDescription()
        );
        return ResponseEntity.ok(fhirMapper.toSuggestionParameters(suggestion));
    }

    /**
     * AI-only validation: missing fields, warnings, score, ready (Gemini/OpenAI prompts).
     */
    @PostMapping(value = "/fhir/$ai-review",
            consumes = {FhirMediaTypes.FHIR_JSON, FhirMediaTypes.JSON})
    public ResponseEntity<Map<String, Object>> reviewWithAi(
            @RequestBody Map<String, Object> parameters,
            @AuthenticationPrincipal User currentUser) {
        try {
            AiReviewRequestDto dto = fhirMapper.toAiReviewRequest(parameters);
            AiReviewResponseDto review = aiReviewService.review(dto);
            return ResponseEntity.ok(fhirMapper.toAiReviewParameters(review));
        } catch (IllegalStateException | IllegalArgumentException ex) {
            Map<String, Object> outcome = new java.util.LinkedHashMap<String, Object>();
            outcome.put("resourceType", "OperationOutcome");
            Map<String, Object> issue = new java.util.LinkedHashMap<String, Object>();
            issue.put("severity", "error");
            issue.put("code", "exception");
            issue.put("diagnostics", ex.getMessage());
            outcome.put("issue", java.util.Collections.singletonList(issue));
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body(outcome);
        } catch (Exception ex) {
            Map<String, Object> outcome = new java.util.LinkedHashMap<String, Object>();
            outcome.put("resourceType", "OperationOutcome");
            Map<String, Object> issue = new java.util.LinkedHashMap<String, Object>();
            issue.put("severity", "error");
            issue.put("code", "exception");
            issue.put("diagnostics", "AI validation failed: " + ex.getMessage());
            outcome.put("issue", java.util.Collections.singletonList(issue));
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body(outcome);
        }
    }
}
