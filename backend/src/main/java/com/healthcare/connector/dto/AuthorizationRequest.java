package com.healthcare.connector.dto;

import lombok.Data;

@Data
public class AuthorizationRequest {
    private String patientName;
    private String patientDob;
    private String patientGender;
    private String patientMemberId;
    private String npiNumber;
    private String providerName;
    private String icd10Code;
    private String diagnosisDescription;
    private String cptCode;
    private String procedureDescription;
    private String clinicalNotes;
    private String insuranceId;
    private String insurancePlan;
    private String urgencyLevel;
}
