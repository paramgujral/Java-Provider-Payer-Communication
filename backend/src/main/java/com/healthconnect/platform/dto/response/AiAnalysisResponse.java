package com.healthconnect.platform.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiAnalysisResponse {
    private Integer completenessScore;
    private Integer approvalProbability;
    private String riskLevel;
    private List<AiIssue> issues;        // NEW: severity-tiered issues
    private List<String> recommendations;
    private List<String> missingFields;
    private List<String> warnings;
    private String summary;
    private String suggestedNarrative;   // NEW: draft narrative when notes are empty

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AiIssue {
        private String severity;    // ERROR, WARNING, INFO
        private String field;
        private String title;
        private String detail;
        private String suggestion;
    }
}
