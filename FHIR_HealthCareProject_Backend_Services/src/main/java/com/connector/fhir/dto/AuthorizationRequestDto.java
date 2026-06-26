package com.connector.fhir.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class AuthorizationRequestDto {

    @NotNull(message = "Patient ID is required")
    private Long patientId;

    @NotNull(message = "Coverage ID is required")
    private Long coverageId;

    @NotBlank(message = "Diagnosis code is required")
    private String diagnosisCode;

    private String diagnosisDescription;

    @NotBlank(message = "Treatment code is required")
    private String treatmentCode;

    private String treatmentDescription;

    private String notes;
    private String status; // DRAFT or SUBMITTED
    private Long providerId;

    public AuthorizationRequestDto() {}

    // Getters and Setters
    public Long getPatientId() { return patientId; }
    public void setPatientId(Long patientId) { this.patientId = patientId; }

    public Long getCoverageId() { return coverageId; }
    public void setCoverageId(Long coverageId) { this.coverageId = coverageId; }

    public String getDiagnosisCode() { return diagnosisCode; }
    public void setDiagnosisCode(String diagnosisCode) { this.diagnosisCode = diagnosisCode; }

    public String getDiagnosisDescription() { return diagnosisDescription; }
    public void setDiagnosisDescription(String diagnosisDescription) { this.diagnosisDescription = diagnosisDescription; }

    public String getTreatmentCode() { return treatmentCode; }
    public void setTreatmentCode(String treatmentCode) { this.treatmentCode = treatmentCode; }

    public String getTreatmentDescription() { return treatmentDescription; }
    public void setTreatmentDescription(String treatmentDescription) { this.treatmentDescription = treatmentDescription; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Long getProviderId() { return providerId; }
    public void setProviderId(Long providerId) { this.providerId = providerId; }
}
