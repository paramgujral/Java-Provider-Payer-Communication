package com.sana.healthcareconnector.service;

import ca.uhn.fhir.context.FhirContext;
import com.sana.healthcareconnector.dto.ClaimValidationRequestDTO;
import org.hl7.fhir.r4.model.Bundle;
import org.hl7.fhir.r4.model.Condition;
import org.hl7.fhir.r4.model.Patient;
import org.hl7.fhir.r4.model.Procedure;
import org.springframework.stereotype.Service;

@Service
public class FhirBundleService {

    public String convertToFhir(ClaimValidationRequestDTO request){

        FhirContext ctx = FhirContext.forR4();

        Patient patient = new Patient();
        patient.addName().setText(request.getPatientName());

        Condition condition = new Condition();
        condition.getCode().setText(request.getDiagnosis());

        Procedure procedure = new Procedure();
        procedure.getCode().setText(request.getTreatment());

        Bundle bundle = new Bundle();
        bundle.setType(Bundle.BundleType.COLLECTION);

        bundle.addEntry().setResource(patient);
        bundle.addEntry().setResource(condition);
        bundle.addEntry().setResource(procedure);

        return ctx.newJsonParser()
                .setPrettyPrint(true)
                .encodeResourceToString(bundle);
    }
}
