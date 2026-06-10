package com.healthconnect.platform.entity;

import com.healthconnect.platform.enums.RequestStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "authorization_requests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthorizationRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 20)
    private String referenceNumber; // e.g. HC-2024-00001

    // Patient Information
    @Column(nullable = false, length = 100)
    private String patientName;

    @Column(nullable = false, length = 20)
    private String patientDob; // Date of birth YYYY-MM-DD

    @Column(nullable = false, length = 20)
    private String patientMemberId;

    @Column(length = 50)
    private String patientInsurancePlan;

    // Clinical Information
    @Column(nullable = false, length = 20)
    private String diagnosisCode; // ICD-10

    @Column(nullable = false, length = 200)
    private String diagnosisDescription;

    @Column(nullable = false, length = 20)
    private String procedureCode; // CPT

    @Column(nullable = false, length = 200)
    private String procedureDescription;

    @Column(nullable = false, length = 50)
    private String serviceType; // e.g. Inpatient, Outpatient, Specialist

    @Column(nullable = false)
    private LocalDate requestedServiceDate;

    @Column(nullable = false)
    private LocalDate requestedServiceEndDate;

    @Column(length = 50)
    private String facilityName;

    @Column(length = 50)
    private String treatingPhysician;

    @Column(columnDefinition = "TEXT")
    private String clinicalNotes;

    @Column(columnDefinition = "TEXT")
    private String supportingDocuments; // comma-separated list of doc names

    // AI Analysis Results
    private Integer aiCompletenessScore;   // 0-100
    private Integer aiApprovalProbability; // 0-100

    @Column(columnDefinition = "TEXT")
    private String aiRecommendations; // JSON array string

    // Payer Review
    @Column(columnDefinition = "TEXT")
    private String reviewerNotes;

    @Column(columnDefinition = "TEXT")
    private String denialReason;

    @Column(columnDefinition = "TEXT")
    private String additionalInfoRequested;

    // Workflow
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private RequestStatus status = RequestStatus.DRAFT;

    // Priority
    @Column(nullable = false, length = 10)
    @Builder.Default
    private String priority = "NORMAL"; // URGENT, HIGH, NORMAL, LOW

    // Relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "provider_id", nullable = false)
    private User provider;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewer_id")
    private User reviewer;

    @OneToMany(mappedBy = "authorizationRequest", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<AuditLog> auditLogs = new ArrayList<>();

    @OneToMany(mappedBy = "authorizationRequest", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Notification> notifications = new ArrayList<>();

    // Timestamps
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    private LocalDateTime submittedAt;
    private LocalDateTime reviewedAt;
    private LocalDateTime resolvedAt;

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
