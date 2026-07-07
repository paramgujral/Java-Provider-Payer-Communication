package com.healthconnect.provider.copilot;

import java.util.List;

/** Aggregated copilot review result. */
public record CopilotReport(
        int readinessScore,
        boolean readyToSubmit,
        List<String> advisors,
        List<CopilotFinding> findings) {
}
