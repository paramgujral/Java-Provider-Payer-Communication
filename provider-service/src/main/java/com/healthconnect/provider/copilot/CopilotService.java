package com.healthconnect.provider.copilot;

import com.healthconnect.provider.domain.AuthorizationRequest;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

/** Runs all enabled advisors and aggregates their findings into one report. */
@Service
public class CopilotService {

    private final List<CopilotAdvisor> advisors;

    public CopilotService(List<CopilotAdvisor> advisors) {
        this.advisors = advisors;
    }

    public CopilotReport review(AuthorizationRequest request) {
        List<String> used = new ArrayList<>();
        List<CopilotFinding> findings = new ArrayList<>();
        for (CopilotAdvisor advisor : advisors) {
            if (advisor.enabled()) {
                used.add(advisor.name());
                findings.addAll(advisor.review(request));
            }
        }
        findings.sort(Comparator.comparing(CopilotFinding::severity));

        int score = 100;
        for (CopilotFinding finding : findings) {
            score -= switch (finding.severity()) {
                case ERROR -> 20;
                case WARNING -> 10;
                case INFO -> 2;
            };
        }
        boolean ready = findings.stream().noneMatch(f -> f.severity() == CopilotFinding.Severity.ERROR);
        return new CopilotReport(Math.max(0, score), ready, used, findings);
    }
}
