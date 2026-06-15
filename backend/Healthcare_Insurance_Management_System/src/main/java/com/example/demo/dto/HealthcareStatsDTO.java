package com.example.demo.dto;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HealthcareStatsDTO {

	private long totalPatients;

	private long totalClaims;

	private long pendingClaims;

	private long approvedClaims;

	private long rejectedClaims;
}
