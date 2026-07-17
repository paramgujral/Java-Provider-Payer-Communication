package com.sana.healthcareconnector.service;

import com.sana.healthcareconnector.entity.ClaimEntity;
import com.sana.healthcareconnector.repository.ClaimRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ClaimService {

    @Autowired
    private ClaimRepository claimRepository;

    public ClaimEntity saveClaim(ClaimEntity claim) {
        return claimRepository.save(claim);
    }

    public List<ClaimEntity> getAllClaims() {
        return claimRepository.findAll();
    }

    public ClaimEntity getClaimById(Long id) {
        return claimRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Claim not found"));
    }
}
