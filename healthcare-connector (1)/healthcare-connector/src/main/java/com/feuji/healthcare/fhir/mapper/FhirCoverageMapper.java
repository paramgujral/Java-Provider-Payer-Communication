package com.feuji.healthcare.fhir.mapper;

import com.feuji.healthcare.fhir.dto.FhirCoverageDto;
import com.feuji.healthcare.patient.entity.PatientEntity;
import org.springframework.stereotype.Component;

@Component
public class FhirCoverageMapper {

    public FhirCoverageDto mapToCoverage(
            PatientEntity patient) {

        return FhirCoverageDto.builder()
                .resourceType("Coverage")
                .policyNumber(patient.getPolicyNumber())
                .patientName(
                        patient.getFirstName() + " "
                                + patient.getLastName())
                .payerName("Star Health Insurance")
                .coverageStatus("ACTIVE")
                .coverageType("HEALTH_INSURANCE")
                .build();
    }
}
