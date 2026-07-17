package com.sana.healthcareconnector.dto;

public class ClaimValidationResponseDTO {

    private String recommendation;
    private Integer confidenceScore;

    public ClaimValidationResponseDTO() {
    }

    public ClaimValidationResponseDTO(
            String recommendation,
            Integer confidenceScore) {

        this.recommendation = recommendation;
        this.confidenceScore = confidenceScore;
    }

    public String getRecommendation() {
        return recommendation;
    }

    public void setRecommendation(String recommendation) {
        this.recommendation = recommendation;
    }

    public Integer getConfidenceScore() {
        return confidenceScore;
    }

    public void setConfidenceScore(Integer confidenceScore) {
        this.confidenceScore = confidenceScore;
    }
}