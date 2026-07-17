package com.healthcare.authorization.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthorizationUploadRequest {

    @NotBlank
    private String requestNumber;

    @NotNull
    private Long providerId;

    @NotNull
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

    private String payload;
}
