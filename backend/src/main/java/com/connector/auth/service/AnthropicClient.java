package com.connector.auth.service;

import com.connector.auth.domain.*;
import com.connector.auth.mapper.FhirMapper;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

/**
 * Live LLM-backed Copilot. Sends the FHIR Claim plus context to the model and
 * asks for a strict-JSON completeness review. Returns null on any failure so
 * the CopilotService can transparently fall back to the rules engine.
 */
@Component
public class AnthropicClient {

    private static final Logger log = LoggerFactory.getLogger(AnthropicClient.class);

    @Value("${copilot.api-url}")   private String apiUrl;
    @Value("${copilot.api-key}")   private String apiKey;
    @Value("${copilot.api-version}") private String apiVersion;
    @Value("${copilot.model}")     private String model;
    @Value("${copilot.timeout-seconds:30}") private int timeoutSeconds;

    private final ObjectMapper om = new ObjectMapper();
    private final FhirMapper fhirMapper;

    public AnthropicClient(FhirMapper fhirMapper) { this.fhirMapper = fhirMapper; }

    public boolean isConfigured() { return apiKey != null && !apiKey.isBlank(); }

    private static final String SYSTEM_PROMPT = """
            You are a clinical prior-authorization completeness reviewer for a payer-provider platform.
            You receive a FHIR R4 Claim (use = preauthorization). Evaluate whether the request is
            complete and likely to be approved, focusing on: required coding (ICD-10 diagnosis, CPT
            procedure), medical-necessity documentation, conservative-therapy history where relevant,
            units, place of service, and supporting attachments.

            Respond with STRICT JSON only (no markdown, no prose) using exactly this shape:
            {
              "readinessScore": <int 0-100>,
              "decision": "READY" | "NEEDS_FIXES",
              "predictedOutcome": "LIKELY_APPROVE" | "UNCERTAIN" | "LIKELY_DENY",
              "medicalNecessity": "<one-sentence assessment>",
              "summary": "<one-sentence recommendation>",
              "issues": [
                {"severity":"ERROR"|"WARNING"|"INFO","field":"<field>","problem":"<text>","recommendation":"<text>","autoFixable":<bool>}
              ]
            }
            """;

    /** @return a populated CopilotReview, or null if the call could not be completed. */
    public CopilotReview review(AuthorizationRequest r) {
        if (!isConfigured()) return null;
        try {
            ObjectNode claim = fhirMapper.toClaim(r);
            String userContent = "Review this FHIR prior-authorization Claim for completeness "
                    + "and medical necessity:\n\n" + om.writerWithDefaultPrettyPrinter().writeValueAsString(claim);

            ObjectNode body = om.createObjectNode();
            body.put("model", model);
            body.put("max_tokens", 1200);
            body.put("system", SYSTEM_PROMPT);
            ArrayNode messages = body.putArray("messages");
            ObjectNode msg = messages.addObject();
            msg.put("role", "user");
            msg.put("content", userContent);

            HttpClient client = HttpClient.newBuilder()
                    .connectTimeout(Duration.ofSeconds(timeoutSeconds)).build();
            HttpRequest httpRequest = HttpRequest.newBuilder()
                    .uri(URI.create(apiUrl))
                    .timeout(Duration.ofSeconds(timeoutSeconds))
                    .header("content-type", "application/json")
                    .header("x-api-key", apiKey)
                    .header("anthropic-version", apiVersion)
                    .POST(HttpRequest.BodyPublishers.ofString(om.writeValueAsString(body)))
                    .build();

            HttpResponse<String> response = client.send(httpRequest, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() / 100 != 2) {
                log.warn("Copilot LLM call returned HTTP {} - falling back to rules", response.statusCode());
                return null;
            }
            JsonNode root = om.readTree(response.body());
            JsonNode content = root.path("content");
            if (!content.isArray() || content.isEmpty()) return null;

            StringBuilder text = new StringBuilder();
            for (JsonNode block : content) {
                if ("text".equals(block.path("type").asText())) text.append(block.path("text").asText());
            }
            return parse(text.toString());
        } catch (Exception e) {
            log.warn("Copilot LLM call failed ({}) - falling back to rules", e.getMessage());
            return null;
        }
    }

    private CopilotReview parse(String raw) {
        try {
            String json = raw.trim();
            // strip code fences if the model added them
            if (json.startsWith("```")) {
                json = json.replaceAll("(?s)```(json)?", "").trim();
            }
            int start = json.indexOf('{');
            int end = json.lastIndexOf('}');
            if (start < 0 || end < 0) return null;
            json = json.substring(start, end + 1);

            JsonNode n = om.readTree(json);
            CopilotReview review = new CopilotReview();
            review.setSource("LLM");
            review.setReadinessScore(n.path("readinessScore").asInt(0));
            review.setDecision(n.path("decision").asText("NEEDS_FIXES"));
            review.setPredictedOutcome(n.path("predictedOutcome").asText("UNCERTAIN"));
            review.setMedicalNecessity(n.path("medicalNecessity").asText(""));
            review.setSummary(n.path("summary").asText(""));
            for (JsonNode iss : n.path("issues")) {
                CopilotIssue issue = new CopilotIssue();
                issue.setSeverity(Severity.valueOf(iss.path("severity").asText("INFO").toUpperCase()));
                issue.setField(iss.path("field").asText(""));
                issue.setProblem(iss.path("problem").asText(""));
                issue.setRecommendation(iss.path("recommendation").asText(""));
                issue.setAutoFixable(iss.path("autoFixable").asBoolean(false));
                review.addIssue(issue);
            }
            return review;
        } catch (Exception e) {
            log.warn("Could not parse Copilot LLM JSON: {}", e.getMessage());
            return null;
        }
    }
}
