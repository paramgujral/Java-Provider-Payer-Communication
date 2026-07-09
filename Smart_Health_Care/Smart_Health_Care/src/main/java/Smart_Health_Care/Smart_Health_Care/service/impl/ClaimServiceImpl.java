package Smart_Health_Care.Smart_Health_Care.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;

import Smart_Health_Care.Smart_Health_Care.entity.Claim;
import Smart_Health_Care.Smart_Health_Care.repository.ClaimRepository;
import Smart_Health_Care.Smart_Health_Care.service.ClaimService;

@Service
public class ClaimServiceImpl implements ClaimService {
     
	 private final ClaimRepository repository;
	 public ClaimServiceImpl(ClaimRepository repository) {
		 this.repository=repository;
	 }
	 
	 @Override
	 public Claim submitClaim(Claim claim) {
		 claim.setStatus("PENDING");
		 
		 return repository.save(claim);
		 
	 }

	@Override
	public List<Claim> getAllClaims() {
	
		return repository.findAll();
	}

	@Override
	public Claim getClaim(Long id) {
	
		return  repository.findById(id)
				    .orElseThrow(()->new RuntimeException("Claim not found"));
		
	}

	@Override
	public Claim approveClaim(Long claimId) {
		 Claim claim=getClaim(claimId);
		 claim.setStatus("APPROVED");
		 claim.setRejectionReason(null);
		return repository.save(claim);
	}

	@Override
	public Claim rejectClaim(Long claimId, String reason) {
		   
		Claim claim=getClaim(claimId);
		 claim.setStatus("Rejected");
		 claim.setRejectionReason(reason);
		return repository.save(claim);
	}
}
