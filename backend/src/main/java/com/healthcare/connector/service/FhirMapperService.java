package com.healthcare.connector.service;

import ca.uhn.fhir.context.FhirContext;
import ca.uhn.fhir.parser.IParser;
import com.healthcare.connector.models.AuthorizationRequest;
import com.healthcare.connector.models.AuthorizationResponse;
import org.hl7.fhir.r4.model.Claim;
import org.hl7.fhir.r4.model.ClaimResponse;
import org.springframework.stereotype.Service;

import java.time.ZoneId;
import java.util.Date;

@Service
public class FhirMapperService {

    private final FhirContext fhirContext = FhirContext.forR4();
    private final IParser jsonParser = fhirContext.newJsonParser();

    public String toJson(Object resource) {
        return jsonParser.encodeResourceToString((org.hl7.fhir.r4.model.Resource) resource);
    }

    public Claim parseClaim(String json) {
        return jsonParser.parseResource(Claim.class, json);
    }

    public ClaimResponse parseClaimResponse(String json) {
        return jsonParser.parseResource(ClaimResponse.class, json);
    }

    // Build a basic Claim from our request data (simplified)
    public Claim buildClaim(AuthorizationRequest request) {
        Claim claim = new Claim();
        claim.setId(request.getRequestId());
        claim.setStatus(Claim.ClaimStatus.ACTIVE);
        claim.getPatient().setReference("Patient/" + request.getPatientId());
        claim.getProvider().setReference("Practitioner/" + request.getProvider().getNpi());
        claim.addItem().setProductOrService(
                new org.hl7.fhir.r4.model.CodeableConcept()
                        .addCoding(new org.hl7.fhir.r4.model.Coding()
                                .setSystem("http://snomed.info/sct")
                                .setCode(request.getServiceType()))
        );
        return claim;
    }

    public ClaimResponse buildClaimResponse(AuthorizationResponse response) {
        ClaimResponse claimResponse = new ClaimResponse();
        claimResponse.setId(response.getResponseId());
        claimResponse.setStatus(ClaimResponse.ClaimResponseStatus.ACTIVE);
        claimResponse.setOutcome(ClaimResponse.RemittanceOutcome.COMPLETE);
        claimResponse.setCreated(
                Date.from(response.getDecisionDate().atZone(ZoneId.systemDefault()).toInstant())
        );
        return claimResponse;
    }
}
