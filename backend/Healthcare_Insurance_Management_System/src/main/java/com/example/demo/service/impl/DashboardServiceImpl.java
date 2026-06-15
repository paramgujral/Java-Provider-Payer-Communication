package com.example.demo.service.impl;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.dto.HealthcareStatsDTO;
import com.example.demo.dto.InsuranceStatsDTO;
import com.example.demo.health_care.repository.PatientRepository;
import com.example.demo.insurance.model.Claim;
import com.example.demo.insurance.repository.ClaimRepository;
import com.example.demo.insurance.utils.ClaimStatus;
import com.example.demo.service.DashboardService;

@Service
public class DashboardServiceImpl implements DashboardService {

	private final ClaimRepository claimRepository;
	private final PatientRepository patientRepository;

	public DashboardServiceImpl(ClaimRepository claimRepository, PatientRepository patientRepository) {
		this.claimRepository = claimRepository;
		this.patientRepository = patientRepository;
	}

	@Override
	@Transactional(readOnly = true)
	public HealthcareStatsDTO getHealthcareStats() {
		long totalClaims = claimRepository.count();
		long pending = claimRepository.countByStatus(ClaimStatus.PENDING);
		long approved = claimRepository.countByStatus(ClaimStatus.APPROVED);
		long rejected = claimRepository.countByStatus(ClaimStatus.REJECTED);
		long totalPatients = patientRepository.count();
		long underReview = claimRepository.countByStatus(ClaimStatus.UNDER_REVIEW);

		return HealthcareStatsDTO.builder()
				.totalPatients(totalPatients)
				.totalClaims(totalClaims)
				.pendingClaims(pending + underReview)
				.approvedClaims(approved)
				.rejectedClaims(rejected)
				.build();
	}

	@Override
	@Transactional(readOnly = true)
	public InsuranceStatsDTO getInsuranceStats() {
		long received = claimRepository.count();
		long underReview = claimRepository.countByStatus(ClaimStatus.UNDER_REVIEW);
		long approved = claimRepository.countByStatus(ClaimStatus.APPROVED);
		long rejected = claimRepository.countByStatus(ClaimStatus.REJECTED);

		java.math.BigDecimal avg = claimRepository.findAverageClaimAmount();
		if (avg == null) avg = java.math.BigDecimal.ZERO;

		return InsuranceStatsDTO.builder()
				.receivedClaims(received)
				.underReviewClaims(underReview)
				.approvedClaims(approved)
				.rejectedClaims(rejected)
				.averageClaimAmount(avg)
				.build();
	}
}
