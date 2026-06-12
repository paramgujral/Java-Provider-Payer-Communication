package com.healthcare.connector.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "authorization_cases")
@Data
@NoArgsConstructor
public class AuthorizationCase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "case_id", unique = true, nullable = false)
    private String caseId;

    // FHIR Claim fields
    @Column(name = "patient_name")
    private String patientName;

    @Column(name = "patient_dob")
    private String patientDob;

    @Column(name = "patient_gender")
    private String patientGender;

    @Column(name = "patient_member_id")
    private String patientMemberId;

    @Column(name = "npi_number")
    private String npiNumber;

    @Column(name = "provider_name")
    private String providerName;

    @Column(name = "icd10_code")
    private String icd10Code;

    @Column(name = "diagnosis_description", length = 500)
    private String diagnosisDescription;

    @Column(name = "cpt_code")
    private String cptCode;

    @Column(name = "procedure_description", length = 500)
    private String procedureDescription;

    @Column(name = "clinical_notes", columnDefinition = "TEXT")
    private String clinicalNotes;

    @Column(name = "insurance_id")
    private String insuranceId;

    @Column(name = "insurance_plan")
    private String insurancePlan;

    @Column(name = "urgency_level")
    private String urgencyLevel;

    // AI Analysis
    @Column(name = "ai_risk_score")
    private Integer aiRiskScore;

    @Column(name = "ai_risk_level")
    private String aiRiskLevel;

    @Column(name = "ai_analysis", columnDefinition = "TEXT")
    private String aiAnalysis;

    // FHIR Kanban Status
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CaseStatus status = CaseStatus.DRAFT;

    // Relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "provider_id", nullable = false)
    private User provider;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_payer_id")
    private User assignedPayer;

    // Payer decision
    @Column(name = "payer_decision")
    private String payerDecision;

    @Column(name = "payer_notes", columnDefinition = "TEXT")
    private String payerNotes;

    @Column(name = "clarification_requested", columnDefinition = "TEXT")
    private String clarificationRequested;

    // Timestamps
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    @Column(name = "finalized_at")
    private LocalDateTime finalizedAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum CaseStatus {
        DRAFT, TRANSMITTED, PAYER_REVIEW, INFO_REQUESTED, FINALIZED
    }
}
