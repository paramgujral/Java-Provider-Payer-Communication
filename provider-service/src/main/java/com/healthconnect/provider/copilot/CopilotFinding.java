package com.healthconnect.provider.copilot;

/** A single copilot finding. */
public record CopilotFinding(
        Severity severity,
        String field,
        String message,
        String suggestion,
        String source) {

    public enum Severity {
        ERROR,   // blocks submission
        WARNING,
        INFO
    }

    public static CopilotFinding error(String field, String message, String suggestion, String source) {
        return new CopilotFinding(Severity.ERROR, field, message, suggestion, source);
    }

    public static CopilotFinding warning(String field, String message, String suggestion, String source) {
        return new CopilotFinding(Severity.WARNING, field, message, suggestion, source);
    }

    public static CopilotFinding info(String field, String message, String suggestion, String source) {
        return new CopilotFinding(Severity.INFO, field, message, suggestion, source);
    }
}
