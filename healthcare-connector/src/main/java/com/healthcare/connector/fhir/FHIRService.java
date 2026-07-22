package com.healthcare.connector.fhir;

import com.healthcare.connector.entity.AuthorizationRequest;
import org.springframework.stereotype.Service;

@Service
public class FHIRService {

    public String generateClaim(AuthorizationRequest request) {

        return """
        {
          "resourceType": "Claim",
          "status": "active",
          "use": "preauthorization",
          "patient": {
            "display": "%s"
          },
          "provider": {
            "display": "%s"
          },
          "insurance": [{
            "coverage": {
              "display": "%s"
            }
          }],
          "diagnosis": [{
            "diagnosisCodeableConcept": {
              "text": "%s"
            }
          }],
          "procedure": [{
            "procedureCodeableConcept": {
              "text": "%s"
            }
          }]
        }
        """.formatted(
                request.getPatientFirstName() + " " + request.getPatientLastName(),
                request.getProviderName(),
                request.getInsuranceId(),
                request.getDiagnosis(),
                request.getProcedureName()
        );
    }
}