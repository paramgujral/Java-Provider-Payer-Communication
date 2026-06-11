package com.healthcare.connector.fhir;

import ca.uhn.fhir.context.FhirContext;
import com.healthcare.connector.entity.AuthorizationRequest;
import org.hl7.fhir.r4.model.Patient;
import org.springframework.stereotype.Service;

@Service
public class FhirService {

    private final FhirContext fhirContext = FhirContext.forR4();

    public String convertToFhirPatient(AuthorizationRequest request) {
        Patient patient = new Patient();
        patient.setId(request.getPatientId());
        patient.addName().addGiven(request.getPatientName());
        
        return fhirContext.newJsonParser().setPrettyPrint(true).encodeResourceToString(patient);
    }
}
