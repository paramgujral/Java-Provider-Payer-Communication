package com.feuji.healthcare.fhir.dto;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FhirClaimDto {

    private String resourceType;

    private String claimNumber;

    private String patientName;

    private String providerName;

    private String payerName;

    private String diagnosis;

    private String procedureCode;

    private BigDecimal requestedAmount;

    private String status;
}