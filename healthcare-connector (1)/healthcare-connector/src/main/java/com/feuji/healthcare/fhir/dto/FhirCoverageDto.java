package com.feuji.healthcare.fhir.dto;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FhirCoverageDto {

    private String resourceType;

    private String policyNumber;

    private String patientName;

    private String payerName;

    private String coverageStatus;

    private String coverageType;
}