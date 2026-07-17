package com.healthcare.authorization.dto;

import java.time.LocalDateTime;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthorizationResponse {
    private Long id;
    private String requestNumber;
    private Long providerId;
    private Long payerId;
    private String patientName;
    private String patientDob;
    private String patientGender;
    private String patientPhone;
    private String patientAddress;
    private String insuranceCompany;
    private String policyNumber;
    private String memberId;
    private String coverageType;
    private String doctorName;
    private String npiNumber;
    private String hospital;
    private String specialty;
    private String diagnosis;
    private String icd10Code;
    private String procedureName;
    private String cptCode;
    private String reasonForAuthorization;
    private String mriReport;
    private String labReport;
    private String prescription;
    private String medicalHistory;
    private String status;
    private Boolean fhirValid;
    private Integer aiScore;
    private List<String> aiMissing;
    private List<String> aiWarnings;
    private String decisionReason;
    private String patientResourceJson;
    private String coverageResourceJson;
    private String practitionerResourceJson;
    private String claimResourceJson;
    private String documentReferenceResourceJson;
    private String claimResponseResourceJson;
    private LocalDateTime submittedAt;
    private LocalDateTime updatedAt;
}
