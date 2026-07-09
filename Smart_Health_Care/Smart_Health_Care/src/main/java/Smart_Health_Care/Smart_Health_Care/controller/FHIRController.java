package Smart_Health_Care.Smart_Health_Care.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import Smart_Health_Care.Smart_Health_Care.service.FHIRService;

@RestController
@RequestMapping("/fhir")
public class FHIRController {

    @Autowired
    private FHIRService fhirService;

    @GetMapping("/patient")
    public String getPatientResource(
            @RequestParam Long patientId,
            @RequestParam String firstName,
            @RequestParam String lastName) {

        return fhirService.generatePatientResource(
                patientId,
                firstName,
                lastName);
    }
    
    @GetMapping("/{claimId}/fhir")
    public Map<String,Object> exportFFHIR(@PathVariable Long claimId){
    	return fhirService.exportClaim(claimId);
    }
    
    
    
}