package com.connector.fhir.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.connector.fhir.dto.fhir.FhirClaim;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.List;

@Service
public class FHIRValidationService {

    private final ObjectMapper objectMapper = new ObjectMapper();

    public List<String> validateClaim(String fhirJson) {
        List<String> errors = new ArrayList<>();
        try {
            FhirClaim claim = objectMapper.readValue(fhirJson, FhirClaim.class);

            if (!"Claim".equalsIgnoreCase(claim.getResourceType())) {
                errors.add("FHIR resourceType must be 'Claim'");
            }

            if (!"preauthorization".equalsIgnoreCase(claim.getUse())) {
                errors.add("FHIR claim use must be 'preauthorization'");
            }

            if (claim.getPatient() == null || claim.getPatient().getReference() == null) {
                errors.add("FHIR Claim must reference a patient");
            } else if (!claim.getPatient().getReference().startsWith("Patient/")) {
                errors.add("FHIR Patient reference must be in the format 'Patient/{logical-id}'");
            }

            if (claim.getInsurance() == null || claim.getInsurance().isEmpty()) {
                errors.add("FHIR Claim must contain insurance coverage references");
            } else {
                for (FhirClaim.Insurance ins : claim.getInsurance()) {
                    if (ins.getCoverage() == null || ins.getCoverage().getReference() == null) {
                        errors.add("Insurance item must contain a valid coverage reference");
                    } else if (!ins.getCoverage().getReference().startsWith("Coverage/")) {
                        errors.add("FHIR Coverage reference must be in the format 'Coverage/{logical-id}'");
                    }
                }
            }

            if (claim.getDiagnosis() == null || claim.getDiagnosis().isEmpty()) {
                errors.add("FHIR Claim must contain at least one diagnosis block");
            } else {
                for (FhirClaim.Diagnosis diag : claim.getDiagnosis()) {
                    if (diag.getDiagnosisCodeableConcept() == null || diag.getDiagnosisCodeableConcept().getCoding() == null || diag.getDiagnosisCodeableConcept().getCoding().isEmpty()) {
                        errors.add("Diagnosis must contain coding systems (e.g. ICD-10)");
                    }
                }
            }

            if (claim.getItem() == null || claim.getItem().isEmpty()) {
                errors.add("FHIR Claim must contain at least one product or service item");
            } else {
                for (FhirClaim.Item itm : claim.getItem()) {
                    if (itm.getProductOrService() == null || itm.getProductOrService().getCoding() == null || itm.getProductOrService().getCoding().isEmpty()) {
                        errors.add("Claim item must contain product or service coding (e.g. CPT)");
                    }
                }
            }

        } catch (Exception e) {
            errors.add("Invalid FHIR JSON syntax: " + e.getMessage());
        }
        return errors;
    }
}
