package com.feuji.healthcare.fhir.standard.coverage;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FhirCoverageResource {

    private String resourceType;
    private String policyNumber;
    private String patient;
    private String payer;
    private String status;
}