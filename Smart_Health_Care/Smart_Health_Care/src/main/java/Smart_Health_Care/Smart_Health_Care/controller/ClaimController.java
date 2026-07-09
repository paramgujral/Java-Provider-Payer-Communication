package Smart_Health_Care.Smart_Health_Care.controller;

import java.util.List;
import java.util.Map;
import Smart_Health_Care.Smart_Health_Care.service.FHIRService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import Smart_Health_Care.Smart_Health_Care.ai.AICopilotService;
import Smart_Health_Care.Smart_Health_Care.dto.AnalysisResponse;
import Smart_Health_Care.Smart_Health_Care.dto.RejectClaimRequest;
import Smart_Health_Care.Smart_Health_Care.entity.Claim;
import Smart_Health_Care.Smart_Health_Care.service.ClaimService;

@RestController
@RequestMapping("/claims")
@CrossOrigin(origins="http://localhost:4200")
public class ClaimController {
 
 private final  ClaimService service;
 @Autowired
 private AICopilotService aiCopilotService;
 @Autowired
 private FHIRService fhirService;
  
 public ClaimController(ClaimService service) {
	 this.service=service;
 }
 
 @PostMapping
 public Claim submitClaim(@RequestBody Claim claim) {
	 return service.submitClaim(claim);
 }


@GetMapping
public List<Claim> getAllClaims(){
	return service.getAllClaims();
}

@GetMapping("/{id}")
 public Claim getClaim(@PathVariable Long id) {
   return service.getClaim(id);	 
 }
@PutMapping("/{claimId}/approve")
public Claim approve(@PathVariable Long claimId) {
	return service.approveClaim(claimId);}
	
	@PutMapping("/{claimId}/reject")
	public Claim reject(@PathVariable Long claimId,@RequestBody RejectClaimRequest request) {
		return service.rejectClaim(claimId, request.getReason());

}
@GetMapping("/{claimId}/status")
public String status(@PathVariable Long claimId) {
	return service.getClaim(claimId).getStatus();
}
@GetMapping("/{id}/analyze")
public AnalysisResponse analyzeClaim(@PathVariable Long id) {
    Claim claim = service.getClaim(id);
    return aiCopilotService.analyzeClaim(claim);
}

@GetMapping("/{claimId}/fhir")
public Map<String,Object> exportFFHIR(@PathVariable Long claimId){
	return fhirService.exportClaim(claimId);
}
}
 
 
 
 
 