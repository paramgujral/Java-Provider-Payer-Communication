package com.healthconn.healthcare_connector.provider.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.healthconn.healthcare_connector.provider.dto.AiReviewRequestDto;
import com.healthconn.healthcare_connector.provider.dto.AiReviewResponseDto;
import com.healthconn.healthcare_connector.provider.dto.FieldGuideDto;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Calls Gemini/OpenAI using LLM prompts from {@link AiPrompts}.
 */
@Slf4j
@Service
public class AiReviewService {

    @Value("${app.ai.provider:gemini}")
    private String aiProvider;

    @Value("${app.ai.gemini.api-key:}")
    private String geminiApiKey;

    @Value("${app.ai.gemini.api-url:https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent}")
    private String geminiApiUrl;

    @Value("${app.ai.gemini.fallback-models:gemini-3.1-flash-lite,gemini-flash-latest,gemini-3-flash-preview}")
    private String geminiFallbackModels;

    @Value("${app.ai.openai.api-key:}")
    private String openAiApiKey;

    @Value("${app.ai.openai.api-url:https://api.openai.com/v1/chat/completions}")
    private String openAiApiUrl;

    @Value("${app.ai.openai.model:gpt-4o-mini}")
    private String openAiModel;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public AiReviewResponseDto review(AiReviewRequestDto request) {
        String provider = aiProvider == null ? "gemini" : aiProvider.trim().toLowerCase();
        String prompt = buildLlmPrompt(request);

        if ("gemini".equals(provider)) {
            if (!isKeyConfigured(geminiApiKey)) {
                throw new IllegalStateException(
                        "Gemini API key is missing. Set app.ai.gemini.api-key in application-local.properties");
            }
            AiReviewResponseDto result = reviewWithGemini(prompt, request);
            result.setEngine("gemini");
            return result;
        }

        if ("openai".equals(provider)) {
            if (!isKeyConfigured(openAiApiKey)) {
                throw new IllegalStateException(
                        "OpenAI API key is missing. Set app.ai.openai.api-key");
            }
            AiReviewResponseDto result = reviewWithOpenAi(prompt, request);
            result.setEngine("openai");
            return result;
        }

        throw new IllegalStateException(
                "Unsupported AI provider '" + provider + "'. Use gemini or openai.");
    }

    private boolean isKeyConfigured(String key) {
        return key != null
                && !key.trim().isEmpty()
                && !"change-me".equalsIgnoreCase(key.trim());
    }

    /** Fill LLM prompt with form values, then send to Gemini. */
    private String buildLlmPrompt(AiReviewRequestDto request) {
        Map<String, String> values = new LinkedHashMap<String, String>();
        values.put("patientName", display(request.getPatientName()));
        values.put("patientId", display(request.getPatientId()));
        values.put("insuranceId", display(request.getInsuranceId()));
        values.put("priority", display(request.getPriority()));
        values.put("diagnosis", display(firstNonBlank(request.getDiagnosisCode(), request.getDiagnosis())));
        values.put("procedureCode", display(request.getProcedureCode()));
        values.put("treatmentDescription", display(firstNonBlank(
                request.getTreatmentDescription(), request.getTreatment(), request.getClinicalNotes())));
        values.put("admissionDate", display(firstNonBlank(request.getAdmissionDate(), request.getTreatmentDate())));
        values.put("expectedDischargeDate", display(request.getExpectedDischargeDate()));
        values.put("patientAge", display(request.getPatientAge()));
        values.put("gender", display(request.getGender()));
        values.put("clinicalNotes", display(request.getClinicalNotes()));
        return AiPrompts.fill(AiPrompts.AI_REVIEW, values);
    }

    @SuppressWarnings("unchecked")
    private AiReviewResponseDto reviewWithGemini(String prompt, AiReviewRequestDto request) {
        List<String> modelUrls = buildGeminiModelUrls();
        Exception lastError = null;

        for (int i = 0; i < modelUrls.size(); i++) {
            String url = modelUrls.get(i);
            try {
                log.info("Calling Gemini model URL: {}", url);
                return callGeminiOnce(url, prompt, request);
            } catch (HttpStatusCodeException ex) {
                lastError = ex;
                int status = ex.getStatusCode().value();
                // 404 = model gone for new users; 503/429 = overloaded — try next model
                if (status == 404 || status == 503 || status == 429) {
                    log.warn("Gemini unavailable ({}). Trying next model. Body={}", status, ex.getResponseBodyAsString());
                    sleepBriefly(400L * (i + 1));
                    continue;
                }
                throw new IllegalStateException(
                        "Gemini API error " + status + ": " + ex.getResponseBodyAsString(), ex);
            } catch (Exception ex) {
                lastError = ex;
                log.warn("Gemini call failed on {}, trying next model: {}", url, ex.getMessage());
                sleepBriefly(300L);
            }
        }

        String detail = lastError == null ? "unknown" : lastError.getMessage();
        throw new IllegalStateException(
                "Gemini is busy on all models right now. Please click Review with AI again in a few seconds. Detail: "
                        + detail);
    }

    private List<String> buildGeminiModelUrls() {
        Set<String> urls = new LinkedHashSet<String>();
        if (geminiApiUrl != null && !geminiApiUrl.trim().isEmpty()) {
            urls.add(geminiApiUrl.trim());
        }
        if (geminiFallbackModels != null && !geminiFallbackModels.trim().isEmpty()) {
            String[] models = geminiFallbackModels.split(",");
            for (String model : models) {
                String name = model.trim();
                if (name.isEmpty()) {
                    continue;
                }
                urls.add("https://generativelanguage.googleapis.com/v1beta/models/"
                        + name + ":generateContent");
            }
        }
        return new ArrayList<String>(urls);
    }

    private void sleepBriefly(long ms) {
        try {
            Thread.sleep(ms);
        } catch (InterruptedException ie) {
            Thread.currentThread().interrupt();
        }
    }

    @SuppressWarnings("unchecked")
    private AiReviewResponseDto callGeminiOnce(String url, String prompt, AiReviewRequestDto request) {
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
        generationConfig.put("temperature", 0.2);
        generationConfig.put("maxOutputTokens", 800);
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
            throw new IllegalStateException("Empty response from Gemini AI");
        }

        List<?> candidates = (List<?>) response.getBody().get("candidates");
        if (candidates == null || candidates.isEmpty()) {
            Object feedback = response.getBody().get("promptFeedback");
            throw new IllegalStateException("Gemini returned no candidates. Feedback=" + feedback);
        }

        Map<?, ?> candidate = (Map<?, ?>) candidates.get(0);
        Map<?, ?> contentMap = (Map<?, ?>) candidate.get("content");
        if (contentMap == null) {
            throw new IllegalStateException("Gemini candidate has no content");
        }

        List<?> responseParts = (List<?>) contentMap.get("parts");
        if (responseParts == null || responseParts.isEmpty()) {
            throw new IllegalStateException("Gemini content has no parts");
        }

        Map<?, ?> firstPart = (Map<?, ?>) responseParts.get(0);
        String text = String.valueOf(firstPart.get("text")).trim();
        return parseAiJson(text, request);
    }

    @SuppressWarnings("unchecked")
    private AiReviewResponseDto reviewWithOpenAi(String prompt, AiReviewRequestDto request) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(openAiApiKey.trim());
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> system = new HashMap<String, Object>();
        system.put("role", "system");
        system.put("content", "You are a prior-authorization clinical reviewer. Reply with JSON only.");

        Map<String, Object> user = new HashMap<String, Object>();
        user.put("role", "user");
        user.put("content", prompt);

        List<Map<String, Object>> messages = new ArrayList<Map<String, Object>>();
        messages.add(system);
        messages.add(user);

        Map<String, Object> body = new HashMap<String, Object>();
        body.put("model", openAiModel);
        body.put("messages", messages);
        body.put("max_tokens", 700);
        body.put("temperature", 0.2);

        ResponseEntity<Map> response = restTemplate.exchange(
                openAiApiUrl,
                HttpMethod.POST,
                new HttpEntity<Map<String, Object>>(body, headers),
                Map.class
        );

        if (response.getBody() == null) {
            throw new IllegalStateException("Empty response from OpenAI");
        }

        List<?> choices = (List<?>) response.getBody().get("choices");
        if (choices == null || choices.isEmpty()) {
            throw new IllegalStateException("OpenAI returned no choices");
        }

        Map<?, ?> messageResponse = (Map<?, ?>) ((Map<?, ?>) choices.get(0)).get("message");
        return parseAiJson(String.valueOf(messageResponse.get("content")).trim(), request);
    }

    private AiReviewResponseDto parseAiJson(String content, AiReviewRequestDto request) {
        try {
            String json = extractJsonObject(content);
            JsonNode root = objectMapper.readTree(json);

            int score = root.path("score").asInt(0);
            if (score < 0) {
                score = 0;
            }
            if (score > 100) {
                score = 100;
            }

            boolean ready = root.path("ready").asBoolean(false);
            List<FieldGuideDto> fieldSuggestions = new ArrayList<FieldGuideDto>();
            fieldSuggestions.addAll(readGuideArray(root.path("missing"), "MISSING"));
            fieldSuggestions.addAll(readGuideArray(root.path("warnings"), "WARNING"));

            List<FieldGuideDto> filtered = new ArrayList<FieldGuideDto>();
            for (FieldGuideDto guide : fieldSuggestions) {
                if (isOptionalField(guide.getField())) {
                    continue;
                }
                if ("SUGGESTION".equalsIgnoreCase(guide.getType())) {
                    continue;
                }

                String formValue = resolveFormValue(guide.getField(), request);
                boolean blank = formValue == null || formValue.trim().isEmpty();

                // Missing ONLY when form value is blank. Incomplete name etc. -> Warning.
                if ("MISSING".equalsIgnoreCase(guide.getType()) && !blank) {
                    guide.setType("WARNING");
                }
                if ("WARNING".equalsIgnoreCase(guide.getType()) && blank
                        && !looksLikeFormatIssue(guide.getIssue())) {
                    guide.setType("MISSING");
                    if (guide.getIssue() == null || guide.getIssue().trim().isEmpty()) {
                        guide.setIssue("Required field is blank");
                    }
                }
                if ("MISSING".equalsIgnoreCase(guide.getType()) && looksLikeFormatIssue(guide.getIssue())) {
                    guide.setType("WARNING");
                }

                filtered.add(guide);
            }
            fieldSuggestions = filtered;

            boolean hasBlocking = false;
            for (FieldGuideDto guide : fieldSuggestions) {
                if ("MISSING".equalsIgnoreCase(guide.getType())
                        || "WARNING".equalsIgnoreCase(guide.getType())) {
                    hasBlocking = true;
                    break;
                }
            }
            if (hasBlocking) {
                ready = false;
                if (score >= 80) {
                    score = 75;
                }
            }

            String suggestions = fieldSuggestions.isEmpty()
                    ? "All fields look good."
                    : "See missing / warnings below.";

            return new AiReviewResponseDto(
                    score, ready, suggestions, "NONE", "NONE", null, fieldSuggestions);
        } catch (Exception ex) {
            log.warn("Failed to parse AI JSON response: {}", content);
            throw new IllegalStateException(
                    "AI returned an unexpected response. Please try Review with AI again. Detail: " + ex.getMessage());
        }
    }

    private String resolveFormValue(String field, AiReviewRequestDto request) {
        if (field == null || request == null) {
            return "";
        }
        String f = field.trim().toLowerCase();
        if (f.contains("patient name") || f.equals("name")) {
            return request.getPatientName();
        }
        if (f.contains("patient id")) {
            return request.getPatientId();
        }
        if (f.contains("insurance")) {
            return request.getInsuranceId();
        }
        if (f.contains("diagnosis") || f.contains("icd")) {
            return firstNonBlank(request.getDiagnosisCode(), request.getDiagnosis());
        }
        if (f.contains("procedure") || f.contains("cpt")) {
            return request.getProcedureCode();
        }
        if (f.contains("treatment")) {
            return firstNonBlank(request.getTreatmentDescription(), request.getTreatment(), request.getClinicalNotes());
        }
        if (f.contains("admission") || (f.contains("date") && !f.contains("discharge"))) {
            return firstNonBlank(request.getAdmissionDate(), request.getTreatmentDate());
        }
        if (f.contains("priority")) {
            return request.getPriority();
        }
        return "";
    }

    private String defaultExpectedForField(String field) {
        if (field == null) {
            return "";
        }
        String f = field.toLowerCase();
        if (f.contains("patient name") || f.equals("name")) {
            return "Enter full name, e.g. James Carter";
        }
        if (f.contains("patient id")) {
            return "Enter ID like PT2048";
        }
        if (f.contains("insurance")) {
            return "Enter ID like BCBS71628163";
        }
        if (f.contains("diagnosis") || f.contains("icd")) {
            return "Enter ICD-10 like E11.9";
        }
        if (f.contains("procedure") || f.contains("cpt")) {
            return "Enter CPT like 99213";
        }
        if (f.contains("treatment")) {
            return "Enter clinical description, e.g. Outpatient knee arthroscopy after failed therapy";
        }
        if (f.contains("admission") || f.contains("date")) {
            return "Enter date like 2026-08-01";
        }
        if (f.contains("priority")) {
            return "Use NORMAL, URGENT, or EMERGENCY";
        }
        return "";
    }

    private boolean looksLikeFormatIssue(String issue) {
        if (issue == null || issue.trim().isEmpty()) {
            return false;
        }
        String text = issue.toLowerCase();
        if (text.contains("blank") || text.contains("empty") || text.contains("missing")) {
            return false;
        }
        return text.contains("incomplete")
                || text.contains("prefer")
                || text.contains("format")
                || text.contains("invalid")
                || text.contains("must be")
                || text.contains("characters")
                || text.contains("digits")
                || text.contains("too short")
                || text.contains("surname")
                || text.contains("lacks")
                || text.contains("generic")
                || text.contains("first+last")
                || text.contains("first and last");
    }

    private boolean isOptionalField(String field) {
        if (field == null) {
            return false;
        }
        String f = field.trim().toLowerCase();
        return f.contains("discharge")
                || f.contains("patient age")
                || f.equals("age")
                || f.contains("gender")
                || f.contains("clinical notes");
    }

    private List<FieldGuideDto> readGuideArray(JsonNode arrayNode, String defaultType) {
        List<FieldGuideDto> list = new ArrayList<FieldGuideDto>();
        if (arrayNode == null || !arrayNode.isArray()) {
            return list;
        }
        for (JsonNode item : arrayNode) {
            String type = item.path("type").asText(defaultType).trim();
            if (type.isEmpty()) {
                type = defaultType;
            }
            String field = item.path("field").asText("").trim();
            String issue = item.path("issue").asText("").trim();
            String expected = item.path("expected").asText("").trim();
            if (expected.isEmpty()) {
                expected = defaultExpectedForField(field);
            }
            if (!field.isEmpty() || !issue.isEmpty() || !expected.isEmpty()) {
                list.add(new FieldGuideDto(type.toUpperCase(), field, issue, expected));
            }
        }
        return list;
    }

    private String extractJsonObject(String content) {
        if (content == null) {
            throw new IllegalArgumentException("Empty AI content");
        }
        String cleaned = content.trim();
        if (cleaned.startsWith("```")) {
            cleaned = cleaned.replaceFirst("^```(?:json)?\\s*", "");
            cleaned = cleaned.replaceFirst("\\s*```$", "");
            cleaned = cleaned.trim();
        }
        int start = cleaned.indexOf('{');
        int end = cleaned.lastIndexOf('}');
        if (start >= 0 && end > start) {
            return cleaned.substring(start, end + 1);
        }
        throw new IllegalArgumentException("No JSON object found in AI reply");
    }

    private String firstNonBlank(String... values) {
        if (values == null) {
            return "";
        }
        for (String value : values) {
            if (value != null && !value.trim().isEmpty()) {
                return value.trim();
            }
        }
        return "";
    }

    private String display(String value) {
        if (value == null || value.trim().isEmpty()) {
            return "(blank)";
        }
        return value.trim();
    }
}
