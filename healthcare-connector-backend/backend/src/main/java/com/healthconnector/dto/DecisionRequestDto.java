package com.healthconnector.dto;

public class DecisionRequestDto {
    private String decision; // "APPROVED" or "REJECTED"
    private String notes;

    public String getDecision() { return decision; }
    public void setDecision(String decision) { this.decision = decision; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
