package com.healthconnector.model;

import javax.persistence.*;
import java.time.LocalDateTime;

/**
 * Represents a provider-to-payer prior authorization request.
 * Field groupings loosely mirror FHIR resources:
 *  - patient*        -> FHIR Patient
 *  - insurance*, policyNumber, groupNumber, memberId -> FHIR Coverage
 *  - diagnosis*, requestedProcedure                  -> FHIR Claim / ClaimResponse
 * Kept as a single flattened entity here for simplicity; can be normalized
 * into separate Patient/Coverage/Claim tables (or real FHIR resources via a
 * FHIR server) as the platform grows.
 */
@Entity
@Table(name = "authorization_request")
public class AuthorizationRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String providerUsername;

    private String patientName;
    private String patientDob;
    private String patientGender;

    private String diagnosisCode;
    private String diagnosisDescription;
    private String requestedProcedure;

    private String insuranceProvider;
    private String policyNumber;
    private String groupNumber;
    private String memberId;

    @Enumerated(EnumType.STRING)
    private AuthorizationStatus status = AuthorizationStatus.DRAFT;

    @Column(length = 1000)
    private String payerNotes;

    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();

    // --- getters and setters ---

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getProviderUsername() { return providerUsername; }
    public void setProviderUsername(String providerUsername) { this.providerUsername = providerUsername; }

    public String getPatientName() { return patientName; }
    public void setPatientName(String patientName) { this.patientName = patientName; }

    public String getPatientDob() { return patientDob; }
    public void setPatientDob(String patientDob) { this.patientDob = patientDob; }

    public String getPatientGender() { return patientGender; }
    public void setPatientGender(String patientGender) { this.patientGender = patientGender; }

    public String getDiagnosisCode() { return diagnosisCode; }
    public void setDiagnosisCode(String diagnosisCode) { this.diagnosisCode = diagnosisCode; }

    public String getDiagnosisDescription() { return diagnosisDescription; }
    public void setDiagnosisDescription(String diagnosisDescription) { this.diagnosisDescription = diagnosisDescription; }

    public String getRequestedProcedure() { return requestedProcedure; }
    public void setRequestedProcedure(String requestedProcedure) { this.requestedProcedure = requestedProcedure; }

    public String getInsuranceProvider() { return insuranceProvider; }
    public void setInsuranceProvider(String insuranceProvider) { this.insuranceProvider = insuranceProvider; }

    public String getPolicyNumber() { return policyNumber; }
    public void setPolicyNumber(String policyNumber) { this.policyNumber = policyNumber; }

    public String getGroupNumber() { return groupNumber; }
    public void setGroupNumber(String groupNumber) { this.groupNumber = groupNumber; }

    public String getMemberId() { return memberId; }
    public void setMemberId(String memberId) { this.memberId = memberId; }

    public AuthorizationStatus getStatus() { return status; }
    public void setStatus(AuthorizationStatus status) { this.status = status; }

    public String getPayerNotes() { return payerNotes; }
    public void setPayerNotes(String payerNotes) { this.payerNotes = payerNotes; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
