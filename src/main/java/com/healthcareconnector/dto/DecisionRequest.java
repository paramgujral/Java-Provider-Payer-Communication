package com.healthcareconnector.dto;

public class DecisionRequest {
    private String decision; // "Accepted" | "Rejected"
    private String reason;

    public String getDecision() { return decision; }
    public void setDecision(String decision) { this.decision = decision; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
}
