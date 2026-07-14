package com.feuji.healthcare_connector.entity;

import com.feuji.healthcare_connector.enums.*;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "authorization_requests")
public class AuthorizationRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "provider_id", nullable = false)
    private User provider;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payer_id", nullable = false)
    private User payer;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private RequestStatus status = RequestStatus.DRAFT;

    @Column(name = "patient_first_name", nullable = false, length = 100)
    private String patientFirstName;

    @Column(name = "patient_last_name", nullable = false, length = 100)
    private String patientLastName;

    @Column(name = "patient_dob", nullable = false)
    private LocalDate patientDob;

    @Column(name = "patient_gender", nullable = false, length = 10)
    private String patientGender;

    @Column(name = "patient_phone", nullable = false, length = 15)
    private String patientPhone;

    @Column(name = "patient_email", length = 150)
    private String patientEmail;

    @Column(name = "patient_address", nullable = false, columnDefinition = "TEXT")
    private String patientAddress;

    @Column(name = "insurance_policy_number", nullable = false, length = 50)
    private String insurancePolicyNumber;

    @Column(name = "insurance_group_number", length = 50)
    private String insuranceGroupNumber;

    @Column(name = "subscriber_name", nullable = false, length = 100)
    private String subscriberName;

    @Enumerated(EnumType.STRING)
    @Column(name = "subscriber_relationship", nullable = false, length = 20)
    private SubscriberRelationship subscriberRelationship;

    @Column(name = "coverage_start_date", nullable = false)
    private LocalDate coverageStartDate;

    @Column(name = "coverage_end_date")
    private LocalDate coverageEndDate;

    @Column(name = "primary_diagnosis_code", nullable = false, length = 10)
    private String primaryDiagnosisCode;

    @Column(name = "primary_diagnosis_desc", nullable = false, columnDefinition = "TEXT")
    private String primaryDiagnosisDesc;

    @Column(name = "secondary_diagnosis_code", length = 10)
    private String secondaryDiagnosisCode;

    @Column(name = "secondary_diagnosis_desc", columnDefinition = "TEXT")
    private String secondaryDiagnosisDesc;

    @Column(name = "procedure_code", nullable = false, length = 10)
    private String procedureCode;

    @Column(name = "procedure_description", nullable = false, columnDefinition = "TEXT")
    private String procedureDescription;

    @Column(name = "estimated_cost", nullable = false, precision = 12, scale = 2)
    private BigDecimal estimatedCost;

    @Column(name = "service_date", nullable = false)
    private LocalDate serviceDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Urgency urgency;

    @Enumerated(EnumType.STRING)
    @Column(name = "place_of_service", nullable = false, length = 20)
    private PlaceOfService placeOfService;

    @Column(name = "clinical_notes", nullable = false, columnDefinition = "TEXT")
    private String clinicalNotes;

    @Column(name = "payer_remarks", columnDefinition = "TEXT")
    private String payerRemarks;

    @Column(name = "ai_validation_notes", columnDefinition = "TEXT")
    private String aiValidationNotes;

    @Column(name = "ai_quality_score")
    private Integer aiQualityScore;

    @Column(name = "fhir_bundle_json", columnDefinition = "TEXT")
    private String fhirBundleJson;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Version
    private Long version;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) {
            status = RequestStatus.DRAFT;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public AuthorizationRequest() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getProvider() { return provider; }
    public void setProvider(User provider) { this.provider = provider; }

    public User getPayer() { return payer; }
    public void setPayer(User payer) { this.payer = payer; }

    public RequestStatus getStatus() { return status; }
    public void setStatus(RequestStatus status) { this.status = status; }

    public String getPatientFirstName() { return patientFirstName; }
    public void setPatientFirstName(String patientFirstName) { this.patientFirstName = patientFirstName; }

    public String getPatientLastName() { return patientLastName; }
    public void setPatientLastName(String patientLastName) { this.patientLastName = patientLastName; }

    public LocalDate getPatientDob() { return patientDob; }
    public void setPatientDob(LocalDate patientDob) { this.patientDob = patientDob; }

    public String getPatientGender() { return patientGender; }
    public void setPatientGender(String patientGender) { this.patientGender = patientGender; }

    public String getPatientPhone() { return patientPhone; }
    public void setPatientPhone(String patientPhone) { this.patientPhone = patientPhone; }

    public String getPatientEmail() { return patientEmail; }
    public void setPatientEmail(String patientEmail) { this.patientEmail = patientEmail; }

    public String getPatientAddress() { return patientAddress; }
    public void setPatientAddress(String patientAddress) { this.patientAddress = patientAddress; }

    public String getInsurancePolicyNumber() { return insurancePolicyNumber; }
    public void setInsurancePolicyNumber(String insurancePolicyNumber) { this.insurancePolicyNumber = insurancePolicyNumber; }

    public String getInsuranceGroupNumber() { return insuranceGroupNumber; }
    public void setInsuranceGroupNumber(String insuranceGroupNumber) { this.insuranceGroupNumber = insuranceGroupNumber; }

    public String getSubscriberName() { return subscriberName; }
    public void setSubscriberName(String subscriberName) { this.subscriberName = subscriberName; }

    public SubscriberRelationship getSubscriberRelationship() { return subscriberRelationship; }
    public void setSubscriberRelationship(SubscriberRelationship subscriberRelationship) { this.subscriberRelationship = subscriberRelationship; }

    public LocalDate getCoverageStartDate() { return coverageStartDate; }
    public void setCoverageStartDate(LocalDate coverageStartDate) { this.coverageStartDate = coverageStartDate; }

    public LocalDate getCoverageEndDate() { return coverageEndDate; }
    public void setCoverageEndDate(LocalDate coverageEndDate) { this.coverageEndDate = coverageEndDate; }

    public String getPrimaryDiagnosisCode() { return primaryDiagnosisCode; }
    public void setPrimaryDiagnosisCode(String primaryDiagnosisCode) { this.primaryDiagnosisCode = primaryDiagnosisCode; }

    public String getPrimaryDiagnosisDesc() { return primaryDiagnosisDesc; }
    public void setPrimaryDiagnosisDesc(String primaryDiagnosisDesc) { this.primaryDiagnosisDesc = primaryDiagnosisDesc; }

    public String getSecondaryDiagnosisCode() { return secondaryDiagnosisCode; }
    public void setSecondaryDiagnosisCode(String secondaryDiagnosisCode) { this.secondaryDiagnosisCode = secondaryDiagnosisCode; }

    public String getSecondaryDiagnosisDesc() { return secondaryDiagnosisDesc; }
    public void setSecondaryDiagnosisDesc(String secondaryDiagnosisDesc) { this.secondaryDiagnosisDesc = secondaryDiagnosisDesc; }

    public String getProcedureCode() { return procedureCode; }
    public void setProcedureCode(String procedureCode) { this.procedureCode = procedureCode; }

    public String getProcedureDescription() { return procedureDescription; }
    public void setProcedureDescription(String procedureDescription) { this.procedureDescription = procedureDescription; }

    public BigDecimal getEstimatedCost() { return estimatedCost; }
    public void setEstimatedCost(BigDecimal estimatedCost) { this.estimatedCost = estimatedCost; }

    public LocalDate getServiceDate() { return serviceDate; }
    public void setServiceDate(LocalDate serviceDate) { this.serviceDate = serviceDate; }

    public Urgency getUrgency() { return urgency; }
    public void setUrgency(Urgency urgency) { this.urgency = urgency; }

    public PlaceOfService getPlaceOfService() { return placeOfService; }
    public void setPlaceOfService(PlaceOfService placeOfService) { this.placeOfService = placeOfService; }

    public String getClinicalNotes() { return clinicalNotes; }
    public void setClinicalNotes(String clinicalNotes) { this.clinicalNotes = clinicalNotes; }

    public String getPayerRemarks() { return payerRemarks; }
    public void setPayerRemarks(String payerRemarks) { this.payerRemarks = payerRemarks; }

    public String getAiValidationNotes() { return aiValidationNotes; }
    public void setAiValidationNotes(String aiValidationNotes) { this.aiValidationNotes = aiValidationNotes; }

    public Integer getAiQualityScore() { return aiQualityScore; }
    public void setAiQualityScore(Integer aiQualityScore) { this.aiQualityScore = aiQualityScore; }

    public String getFhirBundleJson() { return fhirBundleJson; }
    public void setFhirBundleJson(String fhirBundleJson) { this.fhirBundleJson = fhirBundleJson; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public Long getVersion() { return version; }
    public void setVersion(Long version) { this.version = version; }
}
