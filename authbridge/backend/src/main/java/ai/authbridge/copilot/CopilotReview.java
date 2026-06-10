package ai.authbridge.copilot;

import ai.authbridge.domain.Enums.Severity;
import java.time.Instant;
import java.util.List;

/** Structured output of the AI copilot review. Shape matches the frontend CopilotReview type. */
public record CopilotReview(
        int completenessScore,
        int approvalLikelihood,
        List<Issue> issues,
        String summary,
        String suggestedNarrative,
        String generatedBy, // "rules" | "llm"
        Instant generatedAt
) {
    public record Issue(Severity severity, String field, String title, String detail, String suggestion) {}
}
