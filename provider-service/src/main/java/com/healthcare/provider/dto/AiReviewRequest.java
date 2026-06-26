package com.healthcare.provider.dto;

import lombok.Data;

@Data
public class AiReviewRequest {

    private String providerName;

    private String patientName;

    private String insuranceId;

    private String diagnosisCode;

    private String procedureCode;

    private String clinicalNotes;
}