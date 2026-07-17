package com.healthcare.authorization.validator;

import java.util.ArrayList;
import java.util.List;

import org.hl7.fhir.instance.model.api.IBaseResource;
import org.hl7.fhir.r4.model.Patient;
import org.springframework.stereotype.Component;

import ca.uhn.fhir.context.FhirContext;
import ca.uhn.fhir.parser.IParser;
import com.healthcare.authorization.dto.ValidationResult;

@Component
public class FhirValidator {

    private final FhirContext fhirContext = FhirContext.forR4();

    public ValidationResult validate(String payload) {
        List<String> errors = new ArrayList<>();

        if (payload == null || payload.isBlank()) {
            errors.add("Payload is empty");
            return ValidationResult.builder().valid(false).errors(errors).build();
        }

        try {
            IParser parser = fhirContext.newJsonParser();
            IBaseResource resource = parser.parseResource(payload);

            if (resource instanceof Patient patient) {
                if (patient.getNameFirstRep().getFamily() == null || patient.getNameFirstRep().getFamily().isBlank()) {
                    errors.add("Missing patient family name");
                }
                if (patient.getIdentifierFirstRep() == null || patient.getIdentifierFirstRep().getValue() == null) {
                    errors.add("Missing patient identifier");
                }
            } else {
                errors.add("Resource is not a Patient resource");
            }
        } catch (Exception ex) {
            errors.add("FHIR parsing failed: " + ex.getMessage());
        }

        return ValidationResult.builder().valid(errors.isEmpty()).errors(errors).build();
    }
}
