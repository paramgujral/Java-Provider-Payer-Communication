package com.healthcare.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.healthcare.dto.AiReviewResponse;
import com.healthcare.entity.AuthorizationRequest;
import com.healthcare.service.AiCopilotService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class AiCopilotServiceImpl implements AiCopilotService {

    @Value("${gemini.api.key:}")
    private String geminiApiKey;

    @Value("${gemini.api.url:https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent}")
    private String geminiApiUrl;

    private final ObjectMapper objectMapper;
    private final WebClient webClient;
    private final com.healthcare.service.ReferenceService referenceService;

    public AiCopilotServiceImpl(ObjectMapper objectMapper, com.healthcare.service.ReferenceService referenceService) {
        this.objectMapper = objectMapper;
        this.webClient = WebClient.builder().build();
        this.referenceService = referenceService;
    }

    @Override
    public Mono<AiReviewResponse> analyzeRequest(AuthorizationRequest request) {
        log.info("Analyzing request using Google Gemini via WebClient for provider: {}", request.getProviderId());
        String prompt = "Act as a medical billing expert. Review the following healthcare authorization request JSON. "
                +
                "Check for missing CPT procedure codes, incompatible diagnosis, and missing required patient data. " +
                "Provide your response STRICTLY as a raw JSON object with no markdown formatting. " +
                "Format required: {\"confidenceScore\": <double between 0.0 and 1.0>, \"requiresCorrection\": <boolean>, \"suggestions\": [\"<string>\"]}. ";
        return callGemini(prompt, request);
    }

    @Override
    public Mono<AiReviewResponse> adjudicateRequest(AuthorizationRequest request) {
        log.info("Adjudicating request using Google Gemini for payer: {}", request.getPayerId());
        String prompt = "Act as an expert Insurance Claims Adjudicator. Review the following healthcare prior authorization request JSON. "
                +
                "Evaluate the medical necessity of the requested procedure against the provided diagnosis. " +
                "Check for potential fraud, upcoding, or policy violations. " +
                "If the procedure is medically necessary and policy-aligned, requiresCorrection should be false (Recommend Approval). "
                +
                "If it should be rejected or requires more info, requiresCorrection should be true. " +
                "Provide your response STRICTLY as a raw JSON object with no markdown formatting. " +
                "Format required: {\"confidenceScore\": <double between 0.0 and 1.0>, \"requiresCorrection\": <boolean>, \"suggestions\": [\"<string>\"]}. ";
        return callGemini(prompt, request);
    }

    private Mono<AiReviewResponse> callGemini(String promptPrefix, AuthorizationRequest request) {
        if (geminiApiKey == null || geminiApiKey.trim().isEmpty()) {
            log.warn("Gemini API key is missing. Falling back to mock response.");
            return Mono.just(createMockResponse(request));
        }

        try {
            String requestJson = objectMapper.writeValueAsString(request);
            String fullPrompt = promptPrefix + "Request Data: " + requestJson;

            Map<String, Object> requestBody = Map.of(
                    "contents", List.of(
                            Map.of("parts", List.of(
                                    Map.of("text", fullPrompt)))));

            String targetUrl = geminiApiUrl.trim() + "?key=" + geminiApiKey.trim();

            return webClient.post()
                    .uri(targetUrl)
                    .contentType(MediaType.APPLICATION_JSON)
                    .header(HttpHeaders.USER_AGENT, "Mozilla/5.0 (Windows NT 10.0; Win64; x64)")
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class)
                    .map(response -> {
                        log.info("Successfully received response from Gemini API: {}", response);
                        try {
                            return parseGeminiResponse(response);
                        } catch (JsonProcessingException e) {
                            log.error("Error parsing Gemini response. Raw response was: {}", response);
                            throw new RuntimeException("Failed to parse Gemini response", e);
                        }
                    })
                    .onErrorResume(e -> {
                        if (e instanceof org.springframework.web.reactive.function.client.WebClientResponseException) {
                            org.springframework.web.reactive.function.client.WebClientResponseException ex = (org.springframework.web.reactive.function.client.WebClientResponseException) e;
                            log.error("Gemini API Error! Status Code: {}, Response Body: {}", ex.getStatusCode(),
                                    ex.getResponseBodyAsString());
                        } else {
                            log.error("Failed to call Gemini API via WebClient: {}", e.getMessage());
                        }
                        AiReviewResponse fallback = new AiReviewResponse();
                        fallback.addSuggestion("AI service is currently unavailable. Please verify manually.");
                        fallback.setConfidenceScore(0.0);
                        return Mono.just(fallback);
                    });

        } catch (Exception e) {
            log.error("Failed to construct Gemini request: {}", e.getMessage());
            // Fallback to safe response
            AiReviewResponse fallback = new AiReviewResponse();
            fallback.addSuggestion("AI service is currently unavailable. Please verify manually.");
            fallback.setConfidenceScore(0.0);
            return Mono.just(fallback);
        }
    }

    @SuppressWarnings("unchecked")
    private AiReviewResponse parseGeminiResponse(String responseBody) throws JsonProcessingException {
        Map<String, Object> root = objectMapper.readValue(responseBody, Map.class);
        List<Map<String, Object>> candidates = (List<Map<String, Object>>) root.get("candidates");
        @SuppressWarnings("unchecked")
        Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
        List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
        String text = (String) parts.get(0).get("text");

        if (text != null) {
            text = text.trim();
            if (text.startsWith("```json")) {
                text = text.substring(7);
            } else if (text.startsWith("```")) {
                text = text.substring(3);
            }
            text = text.trim();
            if (text.endsWith("```")) {
                text = text.substring(0, text.length() - 3);
            }
            text = text.trim();
        }

        return objectMapper.readValue(text, AiReviewResponse.class);
    }

    private AiReviewResponse createMockResponse(AuthorizationRequest request) {
        AiReviewResponse response = new AiReviewResponse();
        boolean hasError = false;

        if (request.getDiagnosisCodes() == null || request.getDiagnosisCodes().isEmpty()) {
            response.addSuggestion("Missing diagnosis codes. Please provide valid ICD-10 codes.");
            hasError = true;
        } else {
            for (String code : request.getDiagnosisCodes()) {
                if (!referenceService.isValidDiagnosisCode(code)) {
                    response.addSuggestion("Backend Validation Failed: Invalid or unrecognized diagnosis code '" + code + "'.");
                    hasError = true;
                }
            }
        }

        if (request.getProcedureCodes() == null || request.getProcedureCodes().isEmpty()) {
            response.addSuggestion("Missing procedure codes. Please provide valid CPT codes.");
            hasError = true;
        } else {
            for (String code : request.getProcedureCodes()) {
                if (!referenceService.isValidProcedureCode(code)) {
                    response.addSuggestion("Backend Validation Failed: Invalid or unrecognized procedure code '" + code + "'.");
                    hasError = true;
                }
            }
        }

        if (request.getPatientInfo() == null || request.getPatientInfo().getMemberId() == null) {
            response.addSuggestion("Patient Member ID is required.");
            hasError = true;
        }

        response.setRequiresCorrection(hasError);
        response.setConfidenceScore(hasError ? 0.45 : 0.95);

        if (!hasError) {
             response.addSuggestion("All codes verified successfully by fallback backend validation.");
        }

        return response;
    }
}
