package com.healthcare.authorization.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

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

    @Column(nullable = false)
    private String requestNumber;

    @Column(nullable = false)
    private Long providerId;

    @Column(nullable = false)
    private Long payerId;

    @Column(nullable = false)
    private String patientName;

    private String patientDob;
    private String patientGender;
    private String patientPhone;

    @Column(length = 1000)
    private String patientAddress;

    private String insuranceCompany;
    private String policyNumber;
    private String memberId;
    private String coverageType;
    private String doctorName;
    private String npiNumber;
    private String hospital;
    private String specialty;

    @Column(length = 1000)
    private String diagnosis;

    private String icd10Code;

    @Column(length = 1000)
    private String procedureName;

    private String cptCode;

    @Column(length = 2000)
    private String reasonForAuthorization;

    @Column(length = 1000)
    private String mriReport;

    @Column(length = 1000)
    private String labReport;

    @Column(length = 1000)
    private String prescription;

    @Column(length = 2000)
    private String medicalHistory;

    @Column(columnDefinition = "TEXT")
    private String payload;

    @Column(nullable = false)
    private String status;

    @Column(nullable = false)
    private Boolean fhirValid;

    private Integer aiScore;

    @Column(columnDefinition = "TEXT")
    private String aiMissingJson;

    @Column(columnDefinition = "TEXT")
    private String aiWarningsJson;

    @Column(length = 2000)
    private String decisionReason;

    @Column(columnDefinition = "TEXT")
    private String patientResourceJson;

    @Column(columnDefinition = "TEXT")
    private String coverageResourceJson;

    @Column(columnDefinition = "TEXT")
    private String practitionerResourceJson;

    @Column(columnDefinition = "TEXT")
    private String claimResourceJson;

    @Column(columnDefinition = "TEXT")
    private String documentReferenceResourceJson;

    @Column(columnDefinition = "TEXT")
    private String claimResponseResourceJson;

    @Builder.Default
    @Column(nullable = false)
    private LocalDateTime submittedAt = LocalDateTime.now();

    @Builder.Default
    @Column(nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();
}
