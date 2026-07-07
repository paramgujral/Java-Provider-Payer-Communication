package com.healthcareconnector.model;

import java.util.ArrayList;
import java.util.List;

/**
 * Represents a provider-initiated authorization request. Field names are
 * intentionally shaped so they can later be mapped onto FHIR Claim /
 * ClaimResponse resources (patient, procedure/diagnosis codes, requester
 * and payer references).
 */
public class AuthorizationRequest {
    private String id;
    private String patientName;
    private String dob;
    private String procedureCode;
    private String diagnosisCode;
    private String provider;
    private String providerUsername;
    private String payer;
    private String payerUsername;
    private String urgency; // "Routine" | "Urgent"
    private String notes;
    private String status; // "Draft" | "Pending" | "Accepted" | "Rejected"
    private AIReview aiReview;
    private String createdAt;
    private String updatedAt;
    private List<HistoryEntry> history = new ArrayList<>();

    public AuthorizationRequest() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getPatientName() { return patientName; }
    public void setPatientName(String patientName) { this.patientName = patientName; }

    public String getDob() { return dob; }
    public void setDob(String dob) { this.dob = dob; }

    public String getProcedureCode() { return procedureCode; }
    public void setProcedureCode(String procedureCode) { this.procedureCode = procedureCode; }

    public String getDiagnosisCode() { return diagnosisCode; }
    public void setDiagnosisCode(String diagnosisCode) { this.diagnosisCode = diagnosisCode; }

    public String getProvider() { return provider; }
    public void setProvider(String provider) { this.provider = provider; }

    public String getProviderUsername() { return providerUsername; }
    public void setProviderUsername(String providerUsername) { this.providerUsername = providerUsername; }

    public String getPayer() { return payer; }
    public void setPayer(String payer) { this.payer = payer; }

    public String getPayerUsername() { return payerUsername; }
    public void setPayerUsername(String payerUsername) { this.payerUsername = payerUsername; }

    public String getUrgency() { return urgency; }
    public void setUrgency(String urgency) { this.urgency = urgency; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public AIReview getAiReview() { return aiReview; }
    public void setAiReview(AIReview aiReview) { this.aiReview = aiReview; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

    public String getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(String updatedAt) { this.updatedAt = updatedAt; }

    public List<HistoryEntry> getHistory() { return history; }
    public void setHistory(List<HistoryEntry> history) { this.history = history; }
}
