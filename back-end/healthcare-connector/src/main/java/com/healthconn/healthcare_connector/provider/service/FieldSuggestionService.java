package com.healthconn.healthcare_connector.provider.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

/**
 * Field hints via Gemini/OpenAI using LLM prompts from {@link AiPrompts}.
 */
@Slf4j
@Service
public class FieldSuggestionService {

    private static final Pattern PATIENT_ID = Pattern.compile("^[A-Za-z]{2,4}\\d{2,10}$");
    private static final Pattern INSURANCE_ID = Pattern.compile("^[A-Za-z0-9\\-]{5,20}$");
    private static final Pattern ICD10 = Pattern.compile("^[A-Za-z]\\d{2}(\\.\\d{1,4})?$");
    private static final Pattern CPT = Pattern.compile("^\\d{5}$");

    @Value("${app.ai.provider:gemini}")
    private String aiProvider;

    @Value("${app.ai.gemini.api-key:}")
    private String geminiApiKey;

    @Value("${app.ai.gemini.api-url:https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent}")
    private String geminiApiUrl;

    @Value("${app.ai.openai.api-key:}")
    private String openAiApiKey;

    @Value("${app.ai.openai.api-url:https://api.openai.com/v1/chat/completions}")
    private String openAiApiUrl;

    @Value("${app.ai.openai.model:gpt-4o-mini}")
    private String openAiModel;

    private final RestTemplate restTemplate = new RestTemplate();

    public String getFieldSuggestion(String fieldName,
                                     String fieldValue,
                                     String diagnosisCode,
                                     String procedureCode,
                                     String treatmentDescription) {
        String provider = aiProvider == null ? "gemini" : aiProvider.trim().toLowerCase();
        String prompt = buildLlmPrompt(fieldName, fieldValue, diagnosisCode, procedureCode, treatmentDescription);

        if ("gemini".equals(provider) && isKeyConfigured(geminiApiKey)) {
            try {
                return callGemini(prompt);
            } catch (Exception ex) {
                log.warn("Gemini suggest failed ({}), using local rules", ex.getMessage());
            }
        }
        if ("openai".equals(provider) && isKeyConfigured(openAiApiKey)) {
            try {
                return callOpenAi(prompt);
            } catch (Exception ex) {
                log.warn("OpenAI suggest failed ({}), using local rules", ex.getMessage());
            }
        }
        return localSuggestion(fieldName, fieldValue, diagnosisCode, procedureCode, treatmentDescription);
    }

    private String buildLlmPrompt(String fieldName,
                                  String fieldValue,
                                  String diagnosisCode,
                                  String procedureCode,
                                  String treatmentDescription) {
        Map<String, String> values = new LinkedHashMap<String, String>();
        values.put("fieldName", fieldName == null ? "" : fieldName);
        values.put("fieldValue", fieldValue == null || fieldValue.trim().isEmpty() ? "(blank)" : fieldValue.trim());
        values.put("diagnosisCode", diagnosisCode == null || diagnosisCode.trim().isEmpty() ? "(blank)" : diagnosisCode.trim());
        values.put("procedureCode", procedureCode == null || procedureCode.trim().isEmpty() ? "(blank)" : procedureCode.trim());
        values.put("treatmentDescription",
                treatmentDescription == null || treatmentDescription.trim().isEmpty()
                        ? "(blank)" : treatmentDescription.trim());
        return AiPrompts.fill(AiPrompts.FIELD_SUGGESTION, values);
    }

    private boolean isKeyConfigured(String key) {
        return key != null
                && !key.trim().isEmpty()
                && !"change-me".equalsIgnoreCase(key.trim());
    }

    @SuppressWarnings("unchecked")
    private String callGemini(String prompt) {
        String url = geminiApiUrl.trim();

        Map<String, Object> part = new HashMap<String, Object>();
        part.put("text", prompt);
        List<Map<String, Object>> parts = new ArrayList<Map<String, Object>>();
        parts.add(part);

        Map<String, Object> content = new HashMap<String, Object>();
        content.put("parts", parts);
        List<Map<String, Object>> contents = new ArrayList<Map<String, Object>>();
        contents.add(content);

        Map<String, Object> body = new HashMap<String, Object>();
        body.put("contents", contents);
        Map<String, Object> generationConfig = new HashMap<String, Object>();
        generationConfig.put("temperature", 0.3);
        generationConfig.put("maxOutputTokens", 80);
        body.put("generationConfig", generationConfig);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("x-goog-api-key", geminiApiKey.trim());

        ResponseEntity<Map> response = restTemplate.exchange(
                url,
                HttpMethod.POST,
                new HttpEntity<Map<String, Object>>(body, headers),
                Map.class
        );
        if (response.getBody() == null) {
            throw new RuntimeException("Empty Gemini response");
        }
        List<?> candidates = (List<?>) response.getBody().get("candidates");
        Map<?, ?> candidate = (Map<?, ?>) candidates.get(0);
        Map<?, ?> contentMap = (Map<?, ?>) candidate.get("content");
        List<?> responseParts = (List<?>) contentMap.get("parts");
        Map<?, ?> firstPart = (Map<?, ?>) responseParts.get(0);
        return String.valueOf(firstPart.get("text")).trim();
    }

    private String callOpenAi(String prompt) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(openAiApiKey.trim());
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> message = new HashMap<String, Object>();
        message.put("role", "user");
        message.put("content", prompt);
        List<Map<String, Object>> messages = new ArrayList<Map<String, Object>>();
        messages.add(message);

        Map<String, Object> body = new HashMap<String, Object>();
        body.put("model", openAiModel);
        body.put("messages", messages);
        body.put("max_tokens", 60);
        body.put("temperature", 0.4);

        ResponseEntity<Map> response = restTemplate.exchange(
                openAiApiUrl,
                HttpMethod.POST,
                new HttpEntity<Map<String, Object>>(body, headers),
                Map.class
        );
        if (response.getBody() == null) {
            throw new RuntimeException("Empty OpenAI response");
        }
        List<?> choices = (List<?>) response.getBody().get("choices");
        Map<?, ?> messageResponse = (Map<?, ?>) ((Map<?, ?>) choices.get(0)).get("message");
        return String.valueOf(messageResponse.get("content")).trim();
    }

    private String localSuggestion(String fieldName,
                                   String fieldValue,
                                   String diagnosisCode,
                                   String procedureCode,
                                   String treatmentDescription) {
        String value = fieldValue == null ? "" : fieldValue.trim();

        if ("patientName".equals(fieldName)) {
            if (value.contains(" ") && value.length() >= 3) {
                return "Looks good";
            }
            return "Did you mean: James Carter, Priya Sharma, or Michael Scott?";
        }
        if ("patientId".equals(fieldName)) {
            if (PATIENT_ID.matcher(value).matches()) {
                return "Looks good";
            }
            return "Expected format: PT followed by digits, e.g. PT2048 or PAT00312";
        }
        if ("insuranceId".equals(fieldName)) {
            if (INSURANCE_ID.matcher(value).matches() && !value.matches("^\\d+$")) {
                return "Looks good";
            }
            return "Expected format: e.g. BCBS71628163 or UHC-0023847";
        }
        if ("diagnosisCode".equals(fieldName)) {
            if (ICD10.matcher(value).matches()) {
                return "Valid ICD-10 code - " + value.toUpperCase();
            }
            return "Expected ICD-10 format, e.g. E11.9 or J18.9";
        }
        if ("procedureCode".equals(fieldName)) {
            if (CPT.matcher(value).matches()) {
                return "CPT " + value + " - looks valid";
            }
            return "Expected 5-digit CPT code, e.g. 99213 or 27447";
        }
        if ("treatmentDescription".equals(fieldName)) {
            if (value.length() >= 20) {
                return "Description looks good";
            }
            return "Suggested: Provide a clear clinical description of the planned treatment";
        }
        if ("admissionDate".equals(fieldName) || "expectedDischargeDate".equals(fieldName)) {
            return "Date looks good";
        }
        if ("priority".equals(fieldName)) {
            if ("URGENT".equalsIgnoreCase(value)) {
                return "Urgent requires clinical justification within 24 hours";
            }
            if ("EMERGENCY".equalsIgnoreCase(value)) {
                return "Emergency - same-day review, attach ER documentation";
            }
            return "Standard 3-5 business day review applies";
        }
        return "Looks good";
    }
}
