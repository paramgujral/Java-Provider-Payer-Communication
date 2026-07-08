package com.feuji.healthcare.fhir.dto;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FhirPatientDto {

    private String resourceType;

    private Long id;

    private String patientIdentifier;

    private String fullName;

    private String gender;

    private String dateOfBirth;

    private String phoneNumber;

    private String email;
}