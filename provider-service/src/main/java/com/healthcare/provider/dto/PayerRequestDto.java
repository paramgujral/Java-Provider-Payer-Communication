package com.healthcare.provider.dto;

import lombok.Data;

@Data
public class PayerRequestDto {

    private Long providerRequestId;

    private String providerName;

    private String patientName;

    private String insuranceId;

    private String diagnosisCode;

    private String procedureCode;

    private String clinicalNotes;
}