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
public class InsuranceStatsDTO {

	private long receivedClaims;

	private long underReviewClaims;

	private long approvedClaims;

	private long rejectedClaims;

	private BigDecimal averageClaimAmount;
}
