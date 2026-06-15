package com.example.demo.insurance.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.example.demo.ai_validation.model.AIValidation;
import com.example.demo.health_care.model.BaseEntity;
import com.example.demo.health_care.model.Disease;
import com.example.demo.health_care.model.Patient;
import com.example.demo.insurance.utils.ClaimStatus;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "claims")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Claim extends BaseEntity {

	@Column(nullable = false, unique = true)
	private String claimNumber;

	@Column(nullable = false)
	private BigDecimal requestedAmount;

	private BigDecimal approvedAmount;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private ClaimStatus status;

	@Column(length = 2000)
	private String healthcareRemarks;

	@Column(length = 2000)
	private String insuranceRemarks;

	private LocalDateTime submittedAt;

	private LocalDateTime reviewedAt;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "patient_id")
	private Patient patient;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "policy_id")
	private InsurancePolicy insurancePolicy;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "disease_id")
	private Disease disease;

	@OneToOne(fetch = FetchType.LAZY, mappedBy = "claim")
	private AIValidation aiValidation;
}
