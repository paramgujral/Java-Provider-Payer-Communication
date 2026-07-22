package com.healthconn.healthcare_connector.provider.dto;

import lombok.Data;

@Data
public class AiReviewRequestDto {
    private String patientName;
    private String patientAge;
    private String gender;
    private String patientId;
    private String insuranceId;
    private String diagnosis;
    private String diagnosisCode;
    private String treatment;
    private String procedureCode;
    private String treatmentDescription;
    private String treatmentDate;
    private String admissionDate;
    private String expectedDischargeDate;
    private String priority;
    private String clinicalNotes;
}
