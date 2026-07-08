package com.feuji.healthcare.fhir.dto;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FhirClaimResponseDto {

    private String resourceType;

    private String claimNumber;

    private String outcome;

    private String decision;

    private String rejectionReason;
}
