package com.healthcare.connector.authorization.entity;

import com.healthcare.connector.auth.entity.User;
import com.healthcare.connector.authorization.enums.AuthorizationStatus;
import com.healthcare.connector.authorization.enums.Priority;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "authorization_requests")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthorizationRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String referenceNumber;

    // FHIR ClaimResponse/Prior-Auth resource ID
    private String fhirResourceId;
    @Lob
    @Column(columnDefinition = "CLOB")
    private String fhirBundleJson;

    // Patient Information
    private String patientId;
    private String patientName;
    private String patientDob;
    private String patientMemberId;
    private String patientInsuranceId;

    // Provider Information
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "provider_id")
    private User provider;
    private String providerNpi;
    private String providerName;
    private String facilityName;

    // Payer Information
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payer_id")
    private User payer;
    private String payerOrganizationId;
    private String payerName;

    // Clinical Information
    private String diagnosisCode;          // ICD-10
    private String diagnosisDescription;
    private String procedureCode;          // CPT
    private String procedureDescription;
    private String serviceType;
    private LocalDate requestedStartDate;
    private LocalDate requestedEndDate;
    private Integer numberOfUnits;
    private String placeOfService;
    @Lob
    @Column(columnDefinition = "CLOB")
    private String clinicalNotes;

    // Supporting Documents
    @ElementCollection
    @CollectionTable(name = "auth_documents", joinColumns = @JoinColumn(name = "request_id"))
    @Column(name = "document_url")
    private List<String> documentUrls = new ArrayList<>();

    // Status & Workflow
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AuthorizationStatus status;

    @Enumerated(EnumType.STRING)
    private Priority priority;

    // AI Copilot Review
    private boolean aiReviewed;
    @Lob
    @Column(columnDefinition = "CLOB")
    private String aiReviewSummary;
    private Integer aiConfidenceScore;     // 0-100

    @ElementCollection
    @CollectionTable(name = "ai_suggestions", joinColumns = @JoinColumn(name = "request_id"))
    @Column(name = "suggestion", length = 1000)
    private List<String> aiSuggestions = new ArrayList<>();

    // Payer Response
    private String payerDecision;
    private String payerAuthorizationNumber;
    @Lob
    @Column(columnDefinition = "CLOB")
    private String payerDecisionReason;
    @Lob
    @Column(columnDefinition = "CLOB")
    private String payerNotes;
    private LocalDate approvedStartDate;
    private LocalDate approvedEndDate;
    private Integer approvedUnits;

    // Timeline
    private LocalDateTime submittedAt;
    private LocalDateTime reviewedAt;
    private LocalDateTime decidedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDate expiresAt;

    // Audit
    private Integer versionNumber;
    private String lastModifiedBy;

    @OneToMany(mappedBy = "authorizationRequest", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<AuthorizationNote> notes = new ArrayList<>();

    @OneToMany(mappedBy = "authorizationRequest", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<StatusHistory> statusHistory = new ArrayList<>();

    @PrePersist
    public void prePersist() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        versionNumber = 1;
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
        if (versionNumber != null) versionNumber++;
    }
}

