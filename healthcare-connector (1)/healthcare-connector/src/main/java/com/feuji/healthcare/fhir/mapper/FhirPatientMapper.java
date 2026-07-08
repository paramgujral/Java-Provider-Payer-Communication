package com.feuji.healthcare.fhir.mapper;

import com.feuji.healthcare.fhir.dto.FhirPatientDto;
import com.feuji.healthcare.patient.entity.PatientEntity;
import org.springframework.stereotype.Component;

@Component
public class FhirPatientMapper {

    public FhirPatientDto mapToFhirPatient(
            PatientEntity patient) {

        return FhirPatientDto.builder()
                .resourceType("Patient")
                .id(patient.getId())
                .patientIdentifier(
                        patient.getPolicyNumber())
                .fullName(
                        patient.getFirstName()
                                + " "
                                + patient.getLastName())
                .gender(
                        patient.getGender())
                .dateOfBirth(
                        patient.getDateOfBirth()
                                .toString())
                .phoneNumber(
                        patient.getPhoneNumber())
                .email(
                        patient.getEmail())
                .build();
    }
}