package Smart_Health_Care.Smart_Health_Care.service;

import java.util.HashMap;
import java.util.Map;

import org.hl7.fhir.r4.model.HumanName;
import org.hl7.fhir.r4.model.Patient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import Smart_Health_Care.Smart_Health_Care.entity.Claim;
import Smart_Health_Care.Smart_Health_Care.service.ClaimService;
import ca.uhn.fhir.context.FhirContext;

@Service
public class FHIRService {
    @Autowired
	private ClaimService claimService;
    private final FhirContext fhirContext = FhirContext.forR4();

    public String generatePatientResource(Long patientId,
                                          String firstName,
                                          String lastName) {

        Patient patient = new Patient();

        patient.setId(String.valueOf(patientId));
        patient.setActive(true);

        HumanName name = new HumanName();
        name.setFamily(lastName);
        name.addGiven(firstName);

        patient.addName(name);

        return fhirContext.newJsonParser()
                .setPrettyPrint(true)
                .encodeResourceToString(patient);
    }
    
    public Map<String,Object> exportClaim(Long claimId){
    	Claim claim=claimService.getClaim(claimId);
    	
    	Map<String,Object> response=new HashMap<>();
    	response.put("resourceType","claim");
    	response.put("claimId",claim.getClaimId());
    	response.put("patientId",claim.getPatientId());
    	response.put("amount",claim.getAmount());
    	response.put("status",claim.getStatus());
    	
    	return response;
    }
    
    
    
    
}