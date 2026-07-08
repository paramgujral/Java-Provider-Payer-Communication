package com.feuji.healthcare.fhir.mapper;

import com.feuji.healthcare.fhir.standard.patient.*;
import com.feuji.healthcare.patient.entity.PatientEntity;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class StandardFhirPatientMapper {

    public FhirPatientResource map(
            PatientEntity patient) {

        return FhirPatientResource.builder()
                .resourceType("Patient")
                .id(String.valueOf(patient.getId()))
                .identifier(List.of(
                        IdentifierDto.builder()
                                .system("PolicyNumber")
                                .value(patient.getPolicyNumber())
                                .build()
                ))
                .name(List.of(
                        NameDto.builder()
                                .text(
                                        patient.getFirstName()
                                                + " "
                                                + patient.getLastName())
                                .build()
                ))
                .gender(
                        patient.getGender()
                                .toLowerCase())
                .birthDate(
                        patient.getDateOfBirth()
                                .toString())
                .telecom(List.of(
                        TelecomDto.builder()
                                .system("phone")
                                .value(
                                        patient.getPhoneNumber())
                                .build(),
                        TelecomDto.builder()
                                .system("email")
                                .value(
                                        patient.getEmail())
                                .build()
                ))
                .build();
    }
}