package com.feuji.healthcare.fhir.standard.patient;

import lombok.*;

import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FhirPatientResource {

    private String resourceType;

    private String id;

    private List<IdentifierDto> identifier;

    private List<NameDto> name;

    private String gender;

    private String birthDate;

    private List<TelecomDto> telecom;
}