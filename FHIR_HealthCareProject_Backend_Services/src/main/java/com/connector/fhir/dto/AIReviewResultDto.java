package com.connector.fhir.dto;

import java.util.List;

public class AIReviewResultDto {
    private Double confidenceScore;
    private Boolean statusValidation;
    private List<String> issues;
    private List<String> recommendations;

    public AIReviewResultDto() {}

    public AIReviewResultDto(Double confidenceScore, Boolean statusValidation, List<String> issues, List<String> recommendations) {
        this.confidenceScore = confidenceScore;
        this.statusValidation = statusValidation;
        this.issues = issues;
        this.recommendations = recommendations;
    }

    // Getters and Setters
    public Double getConfidenceScore() { return confidenceScore; }
    public void setConfidenceScore(Double confidenceScore) { this.confidenceScore = confidenceScore; }

    public Boolean getStatusValidation() { return statusValidation; }
    public void setStatusValidation(Boolean statusValidation) { this.statusValidation = statusValidation; }

    public List<String> getIssues() { return issues; }
    public void setIssues(List<String> issues) { this.issues = issues; }

    public List<String> getRecommendations() { return recommendations; }
    public void setRecommendations(List<String> recommendations) { this.recommendations = recommendations; }
}
