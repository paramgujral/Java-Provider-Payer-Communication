package com.healthconnect.model;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Represents a Prior Authorization Request.
 * Structurally aligned with the FHIR "Claim" resource (resourceType: Claim)
 * used in Da Vinci Prior Authorization Support (PAS) Implementation Guide.
 *
 * Key FHIR field mappings:
 *  - fhirId          -> Claim.id
 *  - patientName/Id  -> Claim.patient (Reference to Patient)
 *  - providerOrg     -> Claim.provider (Reference to Organization)
 *  - payerOrg        -> Claim.insurer (Reference to Organization)
 *  - procedureCode   -> Claim.item.productOrService (CodeableConcept, CPT/HCPCS)
 *  - diagnosisCode   -> Claim.diagnosis.diagnosisCodeableConcept (ICD-10)
 *  - status          -> Claim.status / ClaimResponse.outcome
 */
@Entity
@Table(name = "authorization_requests")
@Data
@NoArgsConstructor
public class AuthorizationRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** FHIR-style resource identifier, e.g. "Claim/AUTH-2026-00001" */
    @Column(unique = true, nullable = false)
    private String fhirId;

    // ---- Patient (FHIR Patient reference fields, simplified inline) ----
    @Column(nullable = false)
    private String patientName;

    @Column(nullable = false)
    private String patientDob; // ISO date string

    @Column(nullable = false)
    private String patientMemberId; // insurance member ID

    // ---- Provider organization (FHIR Organization reference) ----
    @Column(nullable = false)
    private String providerOrgName;

    @Column(nullable = false)
    private String providerNpi; // National Provider Identifier

    // ---- Payer organization (FHIR Organization reference) ----
    @Column(nullable = false)
    private String payerOrgName;

    // ---- Clinical / service details (FHIR Claim.item / Claim.diagnosis) ----
    @Column(nullable = false)
    private String procedureCode; // CPT/HCPCS code

    @Column(nullable = false)
    private String procedureDescription;

    @Column(nullable = false)
    private String diagnosisCode; // ICD-10 code

    @Column(nullable = false)
    private String diagnosisDescription;

    @Column
    private String requestedServiceDate;

    @Column(columnDefinition = "TEXT")
    private String clinicalNotes;

    @Column
    private Integer unitsRequested;

    // ---- Workflow / status (FHIR Claim.status, ClaimResponse.outcome) ----
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AuthorizationStatus status;

    @Column(columnDefinition = "TEXT")
    private String payerResponseNotes;

    @Column
    private String approvedUnits;

    // ---- AI Copilot review results ----
    @Column(columnDefinition = "TEXT")
    private String aiReviewSummary;

    @Column
    private Integer aiCompletenessScore; // 0-100

    @Column
    private Boolean aiFlaggedIssues = false;

    // ---- Audit fields ----
    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @Column(nullable = false)
    private Long createdByUserId;

    @OneToMany(mappedBy = "authorizationRequest", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AuthorizationHistory> history = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
