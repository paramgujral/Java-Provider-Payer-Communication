package Smart_Health_Care.Smart_Health_Care.service;

import java.util.List;

import org.springframework.stereotype.Service;

import Smart_Health_Care.Smart_Health_Care.entity.Claim;

@Service
public interface ClaimService {

	Claim submitClaim(Claim claim);
	List<Claim> getAllClaims();
	Claim getClaim(Long id);
	Claim approveClaim(Long claimId);
	Claim rejectClaim(Long claimID,String reason);
	
}
