package com.healthcare.connector.ai.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.healthcare.connector.authorization.dto.AuthorizationDTO;
import com.healthcare.connector.authorization.entity.AuthorizationRequest;
import com.healthcare.connector.fhir.dto.FhirValidationResult;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import okhttp3.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * AI Copilot Service — Open-source AI powered prior authorization reviewer.
 *
 * Supports two providers (set via ai.copilot.provider in application.properties):
 *
 *   "groq"   → Llama 3.1 8B via Groq Cloud (recommended — fast, free, open-source)
 *              Get free API key: https://console.groq.com
 *
 *   "ollama" → Local model via Ollama (offline, no API key needed, slower on CPU)
 *              Install: https://ollama.com → ollama pull mistral → ollama serve
 *
 * Both use open-source models. Groq runs Llama 3.1 on dedicated LPU hardware
 * (1–3s response) vs Ollama running locally on CPU (60–90s response).
 *
 * Falls back to FHIR-only validation if neither provider is available.
 */
@Slf4j
@Service
public class AiCopilotService {

    // ─── Provider Selection ───────────────────────────────────────────────────

    @Value("${ai.copilot.provider:groq}")
    private String provider;  // "groq" or "ollama"

    // ─── Groq Config (Llama 3.1 8B — recommended) ────────────────────────────

    @Value("${ai.copilot.groq.base-url:https://api.groq.com/openai/v1}")
    private String groqBaseUrl;

    @Value("${ai.copilot.groq.api-key:}")
    private String groqApiKey;

    @Value("${ai.copilot.groq.model:llama-3.1-8b-instant}")
    private String groqModel;

    // ─── Ollama Config (local fallback) ───────────────────────────────────────

    @Value("${ai.copilot.ollama.base-url:http://localhost:11434}")
    private String ollamaBaseUrl;

    @Value("${ai.copilot.ollama.model:mistral}")
    private String ollamaModel;

    // ─── Shared ───────────────────────────────────────────────────────────────

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final OkHttpClient httpClient = new OkHttpClient.Builder()
            .connectTimeout(30, java.util.concurrent.TimeUnit.SECONDS)
            .readTimeout(120, java.util.concurrent.TimeUnit.SECONDS)
            .callTimeout(180, java.util.concurrent.TimeUnit.SECONDS)
            .build();

    // ─── Lifecycle (Ollama only) ───────────────────────────────────────────────

    /**
     * Warm up Ollama model on startup (only when provider=ollama).
     * Groq is stateless — no warm-up needed.
     */
    @PostConstruct
    public void warmUpOnStartup() {
        if (!"ollama".equalsIgnoreCase(provider)) return;
        new Thread(() -> {
            try {
                log.info("AI Copilot — warming up Ollama model '{}' on startup...", ollamaModel);
                pingOllama();
                log.info("AI Copilot — Ollama model '{}' is ready.", ollamaModel);
            } catch (Exception e) {
                log.warn("AI Copilot — warm-up skipped (Ollama not running): {}", e.getMessage());
            }
        }, "ollama-warmup").start();
    }

    /**
     * Keep Ollama model alive every 4 minutes.
     * Ollama unloads idle models after 5 minutes — this prevents that.
     * Only runs when provider=ollama.
     */
    @Scheduled(fixedDelay = 4 * 60 * 1000)
    public void keepModelAlive() {
        if (!"ollama".equalsIgnoreCase(provider)) return;
        try {
            log.debug("AI Copilot — sending keep-alive ping to Ollama...");
            pingOllama();
            log.debug("AI Copilot — keep-alive ping successful.");
        } catch (Exception e) {
            log.warn("AI Copilot — keep-alive ping failed: {}", e.getMessage());
        }
    }

    private void pingOllama() throws Exception {
        String body = objectMapper.writeValueAsString(Map.of(
                "model",   ollamaModel,
                "prompt",  "hi",
                "stream",  false,
                "options", Map.of("num_predict", 1)
        ));
        Request req = new Request.Builder()
                .url(ollamaBaseUrl + "/api/generate")
                .post(RequestBody.create(body, MediaType.parse("application/json")))
                .addHeader("Content-Type", "application/json")
                .build();
        try (Response res = httpClient.newCall(req).execute()) {
            if (!res.isSuccessful()) {
                throw new RuntimeException("Ollama ping failed: " + res.code());
            }
        }
    }

    // ─── Public API ───────────────────────────────────────────────────────────

    public AuthorizationDTO.AiReviewResponse reviewRequest(
            AuthorizationRequest request,
            FhirValidationResult fhirResult) {
        try {
            String prompt  = buildReviewPrompt(request, fhirResult);
            String rawText = switch (provider.toLowerCase()) {
                case "groq"   -> callGroq(prompt);
                case "ollama" -> callOllama(prompt);
                default       -> {
                    log.warn("Unknown AI provider '{}', falling back to Groq", provider);
                    yield callGroq(prompt);
                }
            };
            return parseAiResponse(rawText, fhirResult);
        } catch (Exception e) {
            log.error("AI review failed (provider={}): {}", provider, e.getMessage());
            return buildFallbackReview(fhirResult);
        }
    }

    // ─── Groq (Llama 3.1 8B) ─────────────────────────────────────────────────

    private String callGroq(String prompt) throws Exception {
        log.info("AI Copilot → Groq (model={})", groqModel);

        if (groqApiKey == null || groqApiKey.isBlank()) {
            throw new RuntimeException("Groq API key not configured. Set ai.copilot.groq.api-key in application.properties");
        }

        String body = objectMapper.writeValueAsString(Map.of(
                "model",       groqModel,
                "messages",    List.of(Map.of("role", "user", "content", prompt)),
                "max_tokens",  1024,
                "temperature", 0.1
        ));

        Request req = new Request.Builder()
                .url(groqBaseUrl + "/chat/completions")
                .post(RequestBody.create(body, MediaType.parse("application/json")))
                .addHeader("Content-Type", "application/json")
                .addHeader("Authorization", "Bearer " + groqApiKey)
                .build();

        try (Response res = httpClient.newCall(req).execute()) {
            String responseBody = res.body().string();
            log.info("Groq response status: {}", res.code());

            if (!res.isSuccessful()) {
                throw new RuntimeException("Groq error: " + res.code() + " — " + responseBody);
            }

            JsonNode json = objectMapper.readTree(responseBody);
            return json.path("choices").get(0).path("message").path("content").asText();
        }
    }

    // ─── Ollama (Local) ───────────────────────────────────────────────────────

    private String callOllama(String prompt) throws Exception {
        log.info("AI Copilot → Ollama (model={})", ollamaModel);

        String body = objectMapper.writeValueAsString(Map.of(
                "model",   ollamaModel,
                "prompt",  prompt,
                "stream",  false,
                "options", Map.of(
                        "temperature", 0.1,
                        "num_predict", 800
                )
        ));

        Request req = new Request.Builder()
                .url(ollamaBaseUrl + "/api/generate")
                .post(RequestBody.create(body, MediaType.parse("application/json")))
                .addHeader("Content-Type", "application/json")
                .build();

        try (Response res = httpClient.newCall(req).execute()) {
            String responseBody = res.body().string();
            log.info("Ollama response status: {}", res.code());

            if (!res.isSuccessful()) {
                throw new RuntimeException("Ollama error: " + res.code() + " — " + responseBody);
            }

            JsonNode json = objectMapper.readTree(responseBody);
            return json.path("response").asText();
        }
    }

    // ─── Prompt Builder ───────────────────────────────────────────────────────

    private String buildReviewPrompt(AuthorizationRequest request, FhirValidationResult fhirResult) {
        StringBuilder sb = new StringBuilder();
        sb.append("You are an expert healthcare prior authorization specialist with deep knowledge of ");
        sb.append("FHIR R4 standards, Da Vinci PAS Implementation Guide, CPT codes, ICD-10 codes, ");
        sb.append("and payer policies. Review this prior authorization request and provide structured feedback.\n\n");

        sb.append("AUTHORIZATION REQUEST:\n");
        sb.append("Reference: ").append(request.getReferenceNumber()).append("\n");
        sb.append("Patient: ").append(request.getPatientName())
                .append(" (DOB: ").append(request.getPatientDob()).append(")\n");
        sb.append("Insurance Member ID: ").append(request.getPatientMemberId()).append("\n");
        sb.append("Provider NPI: ").append(request.getProviderNpi()).append("\n");
        sb.append("Provider: ").append(request.getProviderName()).append("\n");
        sb.append("Payer: ").append(request.getPayerName()).append("\n");
        sb.append("Diagnosis (ICD-10): ").append(request.getDiagnosisCode())
                .append(" - ").append(request.getDiagnosisDescription()).append("\n");
        sb.append("Procedure (CPT): ").append(request.getProcedureCode())
                .append(" - ").append(request.getProcedureDescription()).append("\n");
        sb.append("Service Type: ").append(request.getServiceType()).append("\n");
        sb.append("Requested Dates: ").append(request.getRequestedStartDate())
                .append(" to ").append(request.getRequestedEndDate()).append("\n");
        sb.append("Units Requested: ").append(request.getNumberOfUnits()).append("\n");
        sb.append("Place of Service: ").append(request.getPlaceOfService()).append("\n");
        sb.append("Priority: ").append(request.getPriority()).append("\n");
        sb.append("Clinical Notes: ").append(request.getClinicalNotes()).append("\n\n");

        if (!fhirResult.isValid()) {
            sb.append("FHIR VALIDATION ISSUES:\n");
            fhirResult.getIssues().forEach(issue ->
                    sb.append("- [").append(issue.getCode()).append("] ")
                            .append(issue.getMessage()).append("\n"));
            sb.append("\n");
        }

        sb.append("Respond ONLY with a valid JSON object in this exact format. ");
        sb.append("No markdown, no explanation, no code blocks, only raw JSON:\n");
        sb.append("{\n");
        sb.append("  \"summary\": \"<2-3 sentence overall assessment>\",\n");
        sb.append("  \"confidenceScore\": <integer 0-100 representing likelihood of approval>,\n");
        sb.append("  \"suggestions\": [\"<actionable improvement 1>\", \"<actionable improvement 2>\"],\n");
        sb.append("  \"missingInfo\": [\"<missing field or document 1>\"],\n");
        sb.append("  \"warnings\": [\"<potential payer rejection reason 1>\"],\n");
        sb.append("  \"readyToSubmit\": <true|false>,\n");
        sb.append("  \"fhirComplianceNotes\": \"<FHIR compliance assessment>\"\n");
        sb.append("}");

        return sb.toString();
    }

    // ─── Response Parser ──────────────────────────────────────────────────────

    private AuthorizationDTO.AiReviewResponse parseAiResponse(
            String rawText, FhirValidationResult fhirResult) {
        try {
            String cleaned = rawText
                    .replaceAll("(?s)```json\\s*", "")
                    .replaceAll("(?s)```\\s*", "")
                    .trim();

            int start = cleaned.indexOf('{');
            int end   = cleaned.lastIndexOf('}');
            if (start >= 0 && end > start) {
                cleaned = cleaned.substring(start, end + 1);
            }

            JsonNode node = objectMapper.readTree(cleaned);

            List<String> suggestions = new ArrayList<>();
            node.path("suggestions").forEach(s -> suggestions.add(s.asText()));

            if (!fhirResult.isValid()) {
                fhirResult.getIssues().forEach(issue ->
                        suggestions.add(0, "FHIR: " + issue.getMessage()));
            }

            List<String> missingInfo = new ArrayList<>();
            node.path("missingInfo").forEach(s -> missingInfo.add(s.asText()));

            List<String> warnings = new ArrayList<>();
            node.path("warnings").forEach(s -> warnings.add(s.asText()));

            return AuthorizationDTO.AiReviewResponse.builder()
                    .summary(node.path("summary").asText())
                    .confidenceScore(node.path("confidenceScore").asInt(50))
                    .suggestions(suggestions)
                    .missingInfo(missingInfo)
                    .warnings(warnings)
                    .readyToSubmit(node.path("readyToSubmit").asBoolean())
                    .fhirComplianceNotes(node.path("fhirComplianceNotes").asText())
                    .build();

        } catch (Exception e) {
            log.warn("Could not parse AI JSON response, using fallback. Raw: {}", rawText);
            return buildFallbackReview(fhirResult);
        }
    }

    // ─── Fallback ─────────────────────────────────────────────────────────────

    private AuthorizationDTO.AiReviewResponse buildFallbackReview(FhirValidationResult fhirResult) {
        List<String> suggestions = new ArrayList<>();
        fhirResult.getIssues().forEach(i -> suggestions.add("FHIR: " + i.getMessage()));
        if (suggestions.isEmpty()) {
            suggestions.add("Verify all clinical documentation is attached");
            suggestions.add("Confirm diagnosis supports medical necessity for the requested procedure");
        }

        return AuthorizationDTO.AiReviewResponse.builder()
                .summary("Automated review completed. Please verify clinical details before submission.")
                .confidenceScore(fhirResult.isValid() ? 65 : 40)
                .suggestions(suggestions)
                .missingInfo(List.of())
                .warnings(fhirResult.isValid() ? List.of() :
                        List.of("FHIR validation issues detected — resolve before submission"))
                .readyToSubmit(fhirResult.isValid())
                .fhirComplianceNotes(fhirResult.isValid()
                        ? "Passed basic FHIR R4 validation"
                        : "Failed FHIR validation: " + fhirResult.getIssues().size() + " issue(s) found")
                .build();
    }
}