package com.healthcare.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiReviewRequest {
    private String patientName;
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
}