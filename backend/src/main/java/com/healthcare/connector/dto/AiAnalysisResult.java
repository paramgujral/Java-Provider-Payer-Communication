package com.healthcare.connector.dto;

import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
public class AiAnalysisResult {
    private int riskScore;
    private String riskLevel;          // GREEN / YELLOW / RED
    private List<String> issues;
    private List<String> suggestions;
    private String analysisSummary;
    private Map<String, String> autoFixSuggestions;
}
