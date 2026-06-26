package com.connector.fhir.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "authorization_requests")
public class AuthorizationRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "provider_id", nullable = false)
    private User provider;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "payer_id")
    private User payer;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "coverage_id", nullable = false)
    private Coverage coverage;

    @Column(nullable = false)
    private String status; // DRAFT, SUBMITTED, UNDER_REVIEW, INFO_REQUIRED, APPROVED, REJECTED

    @Column(name = "diagnosis_code", nullable = false)
    private String diagnosisCode;

    @Column(name = "diagnosis_description")
    private String diagnosisDescription;

    @Column(name = "treatment_code", nullable = false)
    private String treatmentCode;

    @Column(name = "treatment_description")
    private String treatmentDescription;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "fhir_resource", nullable = false, columnDefinition = "TEXT")
    private String fhirResource;

    @Column(name = "confidence_score")
    private Double confidenceScore;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
        updatedAt = Instant.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }

    // Default Constructor
    public AuthorizationRequest() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Patient getPatient() { return patient; }
    public void setPatient(Patient patient) { this.patient = patient; }

    public User getProvider() { return provider; }
    public void setProvider(User provider) { this.provider = provider; }

    public User getPayer() { return payer; }
    public void setPayer(User payer) { this.payer = payer; }

    public Coverage getCoverage() { return coverage; }
    public void setCoverage(Coverage coverage) { this.coverage = coverage; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

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

    public String getFhirResource() { return fhirResource; }
    public void setFhirResource(String fhirResource) { this.fhirResource = fhirResource; }

    public Double getConfidenceScore() { return confidenceScore; }
    public void setConfidenceScore(Double confidenceScore) { this.confidenceScore = confidenceScore; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
