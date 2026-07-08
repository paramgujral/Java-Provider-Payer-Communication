package com.feuji.healthcare.fhir.standard.claimresponse;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FhirClaimResponseResource {

    private String resourceType;
    private String claimNumber;
    private String outcome;
    private String rejectionReason;
}