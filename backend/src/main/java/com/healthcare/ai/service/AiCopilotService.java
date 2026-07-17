package com.healthcare.ai.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.healthcare.ai.dto.AiMissingFieldsRequest;
import com.healthcare.ai.dto.AiMissingFieldsResponse;
import com.healthcare.ai.dto.AiRecommendationRequest;
import com.healthcare.ai.dto.AiRecommendationResponse;
import com.healthcare.ai.dto.AiReviewRequest;
import com.healthcare.ai.dto.AiReviewResponse;
import com.healthcare.ai.dto.AiSummaryRequest;
import com.healthcare.ai.dto.AiSummaryResponse;
import com.healthcare.ai.dto.AiValidationRequest;
import com.healthcare.ai.dto.AiValidationResponse;
import com.healthcare.ai.dto.AiValidationSuggestion;

@Service
public class AiCopilotService {

    private static final Logger logger = LoggerFactory.getLogger(AiCopilotService.class);
    private static final String OPENAI_URL = "https://api.openai.com/v1/chat/completions";
    private static final String GEMINI_API_URL_TEMPLATE =
    "https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent";

private static final String GEMINI_VERTEX_URL_TEMPLATE =
    "https://aiplatform.googleapis.com/v1beta/projects/%s/locations/%s/publishers/google/models/%s:generateContent";

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${spring.ai.api-key:}")
    private String apiKey;

    @Value("${spring.ai.provider:openai}")
    private String provider;

    @Value("${spring.ai.chat.model:gpt-4.1}")
    private String model;

    @Value("${spring.ai.gemini.endpoint:}")
    private String geminiEndpoint;

    @Value("${spring.ai.gemini.project-id:}")
    private String geminiProjectId;

    @Value("${spring.ai.gemini.location:us-central1}")
    private String geminiLocation;

    @Value("${spring.ai.gemini.auth-type:api-key}")
    private String geminiAuthType;

    public AiSummaryResponse summarize(AiSummaryRequest request) {
        String prompt = "You are a healthcare prior-authorization copilot. " +
                "Create a concise summary, recommend one of APPROVE / NEED_MORE_INFORMATION / REJECT, " +
                "give a risk level of LOW / MEDIUM / HIGH, and list missing information as a semicolon-separated string. " +
                "Return strict JSON with fields: summary, recommendation, riskLevel, missingFields.";
        Map<String, Object> payload = callOpenAi(prompt, request.getRequestText());
        return buildSummaryResponse(payload);
    }

    public AiRecommendationResponse recommend(AiRecommendationRequest request) {
        String prompt = "You are a healthcare prior-authorization copilot. Analyze the request and produce a recommendation. " +
                "Return strict JSON with fields: recommendation, rationale.";
        Map<String, Object> payload = callOpenAi(prompt, request.getRequestText());
        return buildRecommendationResponse(payload);
    }

    public AiValidationResponse validate(AiValidationRequest request) {
        String prompt = "You are a healthcare prior-authorization reviewer. Review the structured clinical authorization data, " +
                "identify whether it is valid for submission, and return strict JSON with fields: valid, issues, suggestions. " +
                "Suggestions should be an array of objects each with fields field, issue, suggestion, example.";
        Map<String, Object> payload = callOpenAi(prompt, serializeForPrompt(request));
        return buildValidationResponse(payload);
    }

    public AiReviewResponse review(AiReviewRequest request) {
        String prompt = "You are a healthcare prior-authorization reviewer. Validate the submission details for completeness and correct format. " +
                "Check each provided field against the expected clinical input rules and identify missing or invalid entries. " +
                "Patient name must contain only letters, spaces, apostrophes, or hyphens. " +
                "Doctor name must contain only letters, spaces, apostrophes, or hyphens. " +
                "Policy number, member ID, and NPI should be numeric and at least 10 digits long when present. " +
                "Date of birth must be a valid date in ISO format and not in the future. " +
                "If any field is absent or empty, report it as missing. Do not guess or invent values; only report fields that are missing, invalid, or suspicious. " +
                "Return strict JSON only, without markdown, with fields: score, missing, warnings, readyForSubmission. " +
                "Use an empty array for missing or warnings if there are no issues. " +
                "Example:\n{\n  \"score\": 65,\n  \"missing\": [\"Patient name is invalid: contains numbers\", \"Doctor name is missing\"],\n  \"warnings\": [\"Policy number is too short\", \"Date of birth format is invalid\"],\n  \"readyForSubmission\": false\n}";
        Map<String, Object> payload = callOpenAi(prompt, "Request payload:\n" + serializeForPrompt(request));
        return buildReviewResponse(payload);
    }

    public AiMissingFieldsResponse detectMissingFields(AiMissingFieldsRequest request) {
        String prompt = "You are a healthcare prior-authorization copilot. Identify missing or weak information from the request. " +
                "Return strict JSON with field missingFields as an array of short strings.";
        Map<String, Object> payload = callOpenAi(prompt, request.getRequestText());
        return buildMissingFieldsResponse(payload);
    }

    private Map<String, Object> callOpenAi(String systemPrompt, String userContent) {
        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalStateException("AI API key is not configured");
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        String url;
        Map<String, Object> body;

        if ("gemini".equalsIgnoreCase(provider)) {
            if ("api-key".equalsIgnoreCase(geminiAuthType)) {
                headers.add("x-goog-api-key", apiKey);
            } else {
                headers.setBearerAuth(apiKey);
            }

            String combinedContent = systemPrompt + "\n\n" + (userContent == null ? "" : userContent);
            List<String> urls = buildGeminiUrls();
            for (String candidateUrl : urls) {
                String finalUrl = addGeminiApiKey(candidateUrl);
                Map<String, Object> candidateBody;
                candidateBody = buildGeminiBody(combinedContent);

                try {
                    if (logger.isDebugEnabled()) {
                        String bodyJson;
                        try {
                            bodyJson = objectMapper.writeValueAsString(candidateBody);
                        } catch (Exception e) {
                            bodyJson = candidateBody.toString();
                        }
                        logger.debug("Calling Gemini {} with body {}", finalUrl, bodyJson);
                    }
                    System.out.println("=================================================");
System.out.println("Calling URL : " + finalUrl);
System.out.println("Model       : " + model);
System.out.println("Provider    : " + provider);
System.out.println("=================================================");
                    return executeAiRequest(finalUrl, candidateBody, headers, systemPrompt);
                } catch (HttpClientErrorException ex) {
                    System.out.println("Final URL = " + finalUrl);
                    logger.warn("Gemini request failed for {} with status {} and body {}", candidateUrl, ex.getStatusCode(), ex.getResponseBodyAsString());
                    // Try the next URL if available; use fallback only after all endpoints fail.
                }
            }
            logger.error("All Gemini endpoints failed for provider {} model {}", provider, model);
            return buildFallbackResponse(systemPrompt);
        } else {
            url = OPENAI_URL;
            body = Map.of(
                    "model", model,
                    "temperature", 0.2,
                    "max_tokens", 1024,
                    "messages", List.of(
                            Map.of("role", "system", "content", systemPrompt),
                            Map.of("role", "user", "content", userContent == null ? "" : userContent)
                    )
            );
        }

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);
            if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
                throw new IllegalStateException("AI request failed with status " + response.getStatusCode());
            }

            JsonNode root = objectMapper.readTree(response.getBody());
            String content = extractTextFromResponse(root);
            String cleaned = stripCodeFence(content);
            return objectMapper.readValue(cleaned, new TypeReference<>() {});
        } catch (HttpClientErrorException ex) {
            if (ex.getStatusCode() == HttpStatus.TOO_MANY_REQUESTS || ex.getStatusCode() == HttpStatus.SERVICE_UNAVAILABLE) {
                logger.warn("AI request failed with status {}: returning fallback response", ex.getStatusCode());
                return buildFallbackResponse(systemPrompt);
            }
            throw ex;
        } catch (ResourceAccessException ex) {
            logger.warn("AI request failed due to resource access issue: {}. Returning fallback response.", ex.getMessage());
            return buildFallbackResponse(systemPrompt);
        } catch (Exception ex) {
            throw new IllegalStateException("AI response parsing failed", ex);
        }
    }

    private List<String> buildGeminiUrls() {
        if (!geminiEndpoint.isBlank()) {
        return List.of(geminiEndpoint);
    }

    if (!geminiProjectId.isBlank()) {
        return List.of(
            String.format(
                GEMINI_VERTEX_URL_TEMPLATE,
                geminiProjectId,
                geminiLocation,
                model
            )
        );
    }

    return List.of(
        String.format(
            GEMINI_API_URL_TEMPLATE,
            model
        )
    );
    }

    private String addGeminiApiKey(String candidateUrl) {
        if (!"api-key".equalsIgnoreCase(geminiAuthType) || apiKey == null || apiKey.isBlank()) {
            return candidateUrl;
        }
        String separator = candidateUrl.contains("?") ? "&" : "?";
        return candidateUrl + separator + "key=" + apiKey;
    }

    private Map<String, Object> executeAiRequest(String url, Map<String, Object> body, HttpHeaders headers, String systemPrompt) {
        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
        try {
            ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);
            System.out.println("========== AI RESPONSE ==========");
System.out.println("Response Status = " + response.getStatusCode());
System.out.println("Response Body = " + response.getBody());
System.out.println("=================================");
            if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
                String bodyText = response.getBody();
                logger.warn("AI request returned non-2xx status {} and body {}", response.getStatusCode(), bodyText);
                throw new IllegalStateException("AI request failed with status " + response.getStatusCode());
            }
            try {
                JsonNode root = objectMapper.readTree(response.getBody());
                String content = extractTextFromResponse(root);
                String cleaned = extractJsonFromText(content);
                return objectMapper.readValue(cleaned, new TypeReference<>() {});
            } catch (Exception ex) {
                throw new IllegalStateException("AI response parsing failed", ex);
            }
        } catch (HttpClientErrorException ex) {
            if (logger.isWarnEnabled()) {
                logger.warn("AI request failed with status {} and body {}", ex.getStatusCode(), ex.getResponseBodyAsString());
            }
            if (ex.getStatusCode() == HttpStatus.TOO_MANY_REQUESTS || ex.getStatusCode() == HttpStatus.SERVICE_UNAVAILABLE || ex.getStatusCode() == HttpStatus.NOT_FOUND) {
                logger.warn("AI request failed with status {}: returning fallback response", ex.getStatusCode());
                return buildFallbackResponse(systemPrompt);
            }
             System.out.println("STATUS: " + ex.getStatusCode());
    System.out.println("BODY: " + ex.getResponseBodyAsString());
            throw ex;
        } catch (ResourceAccessException ex) {
            logger.warn("AI request failed due to resource access issue: {}. Returning fallback response.", ex.getMessage());
            return buildFallbackResponse(systemPrompt);
        }
    }

    private AiSummaryResponse buildSummaryResponse(Map<String, Object> payload) {
        String summary = asString(payload.get("summary"), "The request appears to require clinical review and supporting documentation.");
        String recommendation = asString(payload.get("recommendation"), "NEED_MORE_INFORMATION");
        String riskLevel = asString(payload.get("riskLevel"), "MEDIUM");
        String missingFields = asString(payload.get("missingFields"), "No missing information detected");

        return AiSummaryResponse.builder()
                .summary(summary)
                .recommendation(recommendation)
                .riskLevel(riskLevel)
                .missingFields(missingFields)
                .build();
    }

    private AiRecommendationResponse buildRecommendationResponse(Map<String, Object> payload) {
        return AiRecommendationResponse.builder()
                .recommendation(asString(payload.get("recommendation"), "NEED_MORE_INFORMATION"))
                .rationale(asString(payload.get("rationale"), "The request was analyzed by the AI copilot."))
                .build();
    }

    private AiValidationResponse buildValidationResponse(Map<String, Object> payload) {
        List<String> issues = readStringList(payload.get("issues"));
        List<AiValidationSuggestion> suggestions = new ArrayList<>();
        Object rawSuggestions = payload.get("suggestions");
        if (rawSuggestions instanceof List<?> list) {
            for (Object item : list) {
                if (item instanceof Map<?, ?> map) {
                    suggestions.add(AiValidationSuggestion.builder()
                            .field(asString(map.get("field"), ""))
                            .issue(asString(map.get("issue"), ""))
                            .suggestion(asString(map.get("suggestion"), ""))
                            .example(asString(map.get("example"), ""))
                            .build());
                }
            }
        }

        return AiValidationResponse.builder()
                .valid(Boolean.TRUE.equals(payload.get("valid")))
                .issues(issues)
                .suggestions(suggestions)
                .build();
    }

    private AiReviewResponse buildReviewResponse(Map<String, Object> payload) {
        List<String> missing = readFlexibleStringList(payload, "missing", "missingFields", "missing_fields");
        List<String> warnings = readFlexibleStringList(payload, "warnings", "warningsList", "warning");
        boolean ready = Boolean.TRUE.equals(payload.get("readyForSubmission")) || Boolean.TRUE.equals(payload.get("ready_for_submission"));

        return AiReviewResponse.builder()
                .score(asInt(payload.get("score"), 70))
                .missing(missing)
                .warnings(warnings)
                .readyForSubmission(ready)
                .build();
    }

    private List<String> readFlexibleStringList(Map<String, Object> payload, String... keys) {
        for (String key : keys) {
            Object value = payload.get(key);
            if (value == null) {
                continue;
            }

            if (value instanceof List<?> list) {
                List<String> converted = new ArrayList<>();
                for (Object item : list) {
                    if (item != null) {
                        converted.add(String.valueOf(item));
                    }
                }
                return converted;
            }

            String text = String.valueOf(value).trim();
            // try parsing JSON array
            try {
                if (text.startsWith("[")) {
                    return objectMapper.readValue(text, new TypeReference<List<String>>() {});
                }
            } catch (Exception ignored) {
            }

            // split on common delimiters
            String[] parts = text.split("[;,\\n\\r]");
            List<String> result = new ArrayList<>();
            for (String p : parts) {
                String t = p.trim();
                if (!t.isEmpty()) {
                    result.add(t);
                }
            }
            if (!result.isEmpty()) {
                return result;
            }
        }
        return List.of();
    }

    private AiMissingFieldsResponse buildMissingFieldsResponse(Map<String, Object> payload) {
        return AiMissingFieldsResponse.builder()
                .missingFields(readStringList(payload.get("missingFields")))
                .build();
    }

    private List<String> readStringList(Object value) {
        if (value instanceof List<?> list) {
            List<String> converted = new ArrayList<>();
            for (Object item : list) {
                if (item != null) {
                    converted.add(String.valueOf(item));
                }
            }
            return converted;
        }
        return new ArrayList<>();
    }

    private String asString(Object value, String fallback) {
        return value == null ? fallback : String.valueOf(value);
    }

    private int asInt(Object value, int fallback) {
        if (value instanceof Number number) {
            return number.intValue();
        }
        return fallback;
    }

    private Map<String, Object> buildGeminiContentBody(String combinedContent) {
        return Map.of(
                "contents", List.of(Map.of(
                        "parts", List.of(Map.of("text", combinedContent))
                )),
                "generationConfig", Map.of(
                        "temperature", 0.0,
                        "maxOutputTokens", 1024,
                        "candidateCount", 1
                )
        );
    }

    private Map<String, Object> buildGeminiBody(String combinedContent) {

    return Map.of(
        "contents", List.of(
            Map.of(
                "parts", List.of(
                    Map.of(
                        "text", combinedContent
                    )
                )
            )
        ),
        "generationConfig", Map.of(
            "temperature", 0.2,
            "maxOutputTokens", 1024
        )
    );
}

    private String stripCodeFence(String content) {
        if (content == null) {
            return "{}";
        }
        String trimmed = content.trim();
        if (trimmed.startsWith("```json")) {
            trimmed = trimmed.substring("```json".length()).trim();
        } else if (trimmed.startsWith("```")) {
            trimmed = trimmed.substring("```".length()).trim();
        }
        if (trimmed.endsWith("```")) {
            trimmed = trimmed.substring(0, trimmed.length() - 3).trim();
        }
        return trimmed.isBlank() ? "{}" : trimmed;
    }

    private String extractJsonFromText(String content) {
        String cleaned = stripCodeFence(content).trim();
        if (cleaned.isBlank()) {
            return "{}";
        }

        if ((cleaned.startsWith("{") && cleaned.endsWith("}")) || (cleaned.startsWith("[") && cleaned.endsWith("]"))) {
            return cleaned;
        }

        int objectStart = cleaned.indexOf('{');
        int objectEnd = cleaned.lastIndexOf('}');
        if (objectStart >= 0 && objectEnd > objectStart) {
            return cleaned.substring(objectStart, objectEnd + 1);
        }

        int arrayStart = cleaned.indexOf('[');
        int arrayEnd = cleaned.lastIndexOf(']');
        if (arrayStart >= 0 && arrayEnd > arrayStart) {
            return cleaned.substring(arrayStart, arrayEnd + 1);
        }

        return cleaned;
    }

    private String extractTextFromResponse(JsonNode root) {
        if (root.has("choices")) {
            return root.path("choices").path(0).path("message").path("content").asText("");
        }
        if (root.has("response")) {
            JsonNode response = root.path("response");
            if (response.has("outputText")) {
                return response.path("outputText").asText("");
            }
            if (response.has("text")) {
                return response.path("text").asText("");
            }
            if (response.has("content")) {
                JsonNode content = response.path("content");
                if (content.isArray() && content.size() > 0) {
                    JsonNode first = content.path(0);
                    if (first.has("text")) {
                        return first.path("text").asText("");
                    }
                }
                return content.asText("");
            }
            if (response.has("outputs") && response.path("outputs").isArray() && response.path("outputs").size() > 0) {
                JsonNode output = response.path("outputs").path(0);
                if (output.has("content")) {
                    JsonNode content = output.path("content");
                    if (content.isArray() && content.size() > 0) {
                        JsonNode first = content.path(0);
                        if (first.has("text")) {
                            return first.path("text").asText("");
                        }
                    }
                    return content.asText("");
                }
                if (output.has("text")) {
                    return output.path("text").asText("");
                }
            }
            if (response.has("candidates") && response.path("candidates").isArray() && response.path("candidates").size() > 0) {
                JsonNode candidate = response.path("candidates").path(0);
                if (candidate.has("content")) {
                    JsonNode content = candidate.path("content");
                    if (content.isArray() && content.size() > 0) {
                        JsonNode first = content.path(0);
                        if (first.has("text")) {
                            return first.path("text").asText("");
                        }
                    }
                    return content.asText("");
                }
                if (candidate.has("message")) {
                    return candidate.path("message").path("content").asText("");
                }
            }
        }
        if (root.has("outputs") && root.path("outputs").isArray() && root.path("outputs").size() > 0) {
            JsonNode output = root.path("outputs").path(0);
            if (output.has("content")) {
                JsonNode content = output.path("content");
                if (content.isArray() && content.size() > 0) {
                    JsonNode first = content.path(0);
                    if (first.has("text")) {
                        return first.path("text").asText("");
                    }
                }
                return content.asText("");
            }
            if (output.has("text")) {
                return output.path("text").asText("");
            }
        }
        if (root.has("candidates")) {
            JsonNode candidate = root.path("candidates").path(0);
            if (candidate.has("content")) {
                JsonNode content = candidate.path("content");
                if (content.isArray() && content.size() > 0) {
                    JsonNode first = content.path(0);
                    if (first.has("text")) {
                        return first.path("text").asText("");
                    }
                }
                return content.asText("");
            }
            if (candidate.has("message")) {
                return candidate.path("message").path("content").asText("");
            }
        }
        if (root.has("content")) {
            JsonNode content = root.path("content");
            if (content.isArray() && content.size() > 0) {
                JsonNode first = content.path(0);
                if (first.has("text")) {
                    return first.path("text").asText("");
                }
            }
            return content.asText("");
        }
        if (root.has("output")) {
            JsonNode output = root.path("output");
            if (output.isArray() && output.size() > 0) {
                return output.path(0).path("content").asText("");
            }
            return output.path("content").asText("");
        }
        return root.toString();
    }

    private String serializeForPrompt(Object payload) {
        try {
            return objectMapper.writeValueAsString(payload);
        } catch (Exception e) {
            return String.valueOf(payload);
        }
    }

    private Map<String, Object> buildFallbackResponse(String systemPrompt) {
        String prompt = systemPrompt.toLowerCase();
        if (prompt.contains("summary") && prompt.contains("recommendation")) {
            return Map.of(
                    "summary", "Fallback summary: clinical review is required.",
                    "recommendation", "NEED_MORE_INFORMATION",
                    "riskLevel", "MEDIUM",
                    "missingFields", "Please review the request details and confirm missing clinical information."
            );
        }
        if (prompt.contains("recommendation") && prompt.contains("rationale")) {
            return Map.of(
                    "recommendation", "NEED_MORE_INFORMATION",
                    "rationale", "AI service unavailable; default recommendation returned."
            );
        }
        if (prompt.contains("valid") && prompt.contains("issues") && prompt.contains("suggestions")) {
            return Map.of(
                    "valid", true,
                    "issues", List.of(),
                    "suggestions", List.of()
            );
        }
        if (prompt.contains("missing or weak information")) {
            return Map.of(
                    "missingFields", List.of()
            );
        }
        if (prompt.contains("review the submission details") || prompt.contains("readyforsubmission")) {
            return Map.of(
                    "score", 0,
                    "missing", List.of("AI review could not be completed because the AI service is unavailable."),
                    "warnings", List.of("AI service unavailable; returning conservative fallback review."),
                    "readyForSubmission", false
            );
        }
        return Map.of(
                "summary", "Fallback summary: clinical review is required.",
                "recommendation", "NEED_MORE_INFORMATION",
                "riskLevel", "MEDIUM",
                "missingFields", "Please review the request details and confirm missing clinical information."
        );
    }
}
