package com.healthcareconnector.dto;

/** Payload the frontend sends when creating a new (Draft) authorization request. */
public class NewRequestDTO {
    private String patientName;
    private String dob;
    private String procedureCode;
    private String diagnosisCode;
    private String provider;
    private String providerUsername;
    private String payer;
    private String payerUsername;
    private String urgency;
    private String notes;

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
}
