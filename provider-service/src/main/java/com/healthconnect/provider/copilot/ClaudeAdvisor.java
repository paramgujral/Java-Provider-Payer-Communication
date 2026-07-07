package com.healthconnect.provider.copilot;

import com.anthropic.client.AnthropicClient;
import com.anthropic.client.okhttp.AnthropicOkHttpClient;
import com.anthropic.models.messages.MessageCreateParams;
import com.anthropic.models.messages.StructuredMessageCreateParams;
import com.anthropic.models.messages.ThinkingConfigAdaptive;
import com.fasterxml.jackson.annotation.JsonPropertyDescription;
import com.healthconnect.provider.domain.AuthorizationRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

/** Optional LLM-based advisor; active only when an Anthropic API key is configured. */
@Component
public class ClaudeAdvisor implements CopilotAdvisor {

    private static final Logger log = LoggerFactory.getLogger(ClaudeAdvisor.class);

    private final AnthropicClient client;
    private final String model;

    public ClaudeAdvisor(@Value("${copilot.claude.api-key:}") String apiKey,
                         @Value("${copilot.claude.model:claude-opus-4-8}") String model) {
        this.model = model;
        this.client = apiKey == null || apiKey.isBlank()
                ? null
                : AnthropicOkHttpClient.builder().apiKey(apiKey).build();
        if (this.client == null) {
            log.info("Claude copilot advisor disabled — no API key configured; using rule-based validation only");
        } else {
            log.info("Claude copilot advisor enabled with model {}", model);
        }
    }

    @Override
    public String name() {
        return "claude-ai";
    }

    @Override
    public boolean enabled() {
        return client != null;
    }

    /** Structured output returned by the model. */
    public record AiFinding(
            @JsonPropertyDescription("ERROR, WARNING or INFO") String severity,
            @JsonPropertyDescription("The form field the finding refers to, e.g. clinicalJustification") String field,
            @JsonPropertyDescription("What is wrong or risky, in one sentence") String message,
            @JsonPropertyDescription("Concrete correction the provider should make before submitting") String suggestion) {
    }

    public record AiReview(List<AiFinding> findings) {
    }

    @Override
    public List<CopilotFinding> review(AuthorizationRequest r) {
        if (client == null) {
            return List.of();
        }
        try {
            StructuredMessageCreateParams<AiReview> params = MessageCreateParams.builder()
                    .model(model)
                    .maxTokens(4096L)
                    .thinking(ThinkingConfigAdaptive.builder().build())
                    .outputConfig(AiReview.class)
                    .addUserMessage(buildPrompt(r))
                    .build();

            return client.messages().create(params).content().stream()
                    .flatMap(block -> block.text().stream())
                    .findFirst()
                    .map(typed -> toFindings(typed.text()))
                    .orElse(List.of());
        } catch (Exception e) {
            log.warn("Claude copilot review failed, continuing with rule-based findings only: {}", e.getMessage());
            return List.of();
        }
    }

    private String buildPrompt(AuthorizationRequest r) {
        return """
                You are an AI copilot inside a healthcare prior-authorization platform. Review the \
                following request the way a payer's utilization-review team would, and report findings \
                that would cause a denial, delay, or request for more information. Focus on what a \
                rules engine cannot catch: whether the diagnosis clinically justifies the procedure, \
                whether the requested amount is plausible for the procedure, whether the clinical \
                justification demonstrates medical necessity, and internal inconsistencies. \
                Do not report simple missing-field problems. Return an empty findings list if the \
                request looks strong.

                Prior-authorization request:
                - Patient: %s %s, born %s, gender %s, member ID %s
                - Insurance: %s (%s)
                - Provider: %s (NPI %s)
                - Diagnosis (ICD-10): %s — %s
                - Procedure (CPT): %s — %s
                - Service date: %s, urgency: %s
                - Requested amount: USD %s
                - Clinical justification: %s
                """.formatted(
                r.getPatientFirstName(), r.getPatientLastName(), r.getPatientDob(), r.getPatientGender(),
                r.getMemberId(), r.getPayerName(), r.getInsurancePlan(), r.getProviderName(), r.getProviderNpi(),
                r.getDiagnosisCode(), r.getDiagnosisDescription(), r.getProcedureCode(), r.getProcedureDescription(),
                r.getServiceDate(), r.getUrgency(), r.getRequestedAmount(), r.getClinicalJustification());
    }

    private List<CopilotFinding> toFindings(AiReview review) {
        List<CopilotFinding> findings = new ArrayList<>();
        if (review == null || review.findings() == null) {
            return findings;
        }
        for (AiFinding f : review.findings()) {
            CopilotFinding.Severity severity;
            try {
                severity = CopilotFinding.Severity.valueOf(f.severity().trim().toUpperCase(Locale.ROOT));
            } catch (Exception e) {
                severity = CopilotFinding.Severity.INFO;
            }
            findings.add(new CopilotFinding(severity, f.field(), f.message(), f.suggestion(), name()));
        }
        return findings;
    }
}
