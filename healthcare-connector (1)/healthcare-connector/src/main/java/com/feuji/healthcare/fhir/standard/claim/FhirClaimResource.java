package com.feuji.healthcare.fhir.standard.claim;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FhirClaimResource {

    private String resourceType;
    private String id;
    private String status;
    private String patient;
    private String provider;
    private String insurer;
}