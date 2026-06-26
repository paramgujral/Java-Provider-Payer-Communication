package com.healthcare.ai.dto;

import lombok.Data;

@Data
public class AuthorizationReviewRequest {

    private String providerName;

    private String patientName;

    private String insuranceId;

    private String diagnosisCode;

    private String procedureCode;

    private String clinicalNotes;
}