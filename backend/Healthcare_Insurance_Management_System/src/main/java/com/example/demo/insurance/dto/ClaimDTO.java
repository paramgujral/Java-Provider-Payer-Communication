package com.example.demo.insurance.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClaimDTO {

    private UUID id;

    private String claimNumber;

    @NotNull(message = "patientId is required")
    private UUID patientId;

    @NotNull(message = "policyId is required")
    private UUID policyId;

    @NotNull(message = "diseaseId is required")
    private UUID diseaseId;

    @NotNull(message = "amount is required")
    private BigDecimal amount;

    @Size(max = 2000)
    private String remarks;

    private String status;

    private BigDecimal requestedAmount;

    private BigDecimal approvedAmount;

    @Size(max = 2000)
    private String healthcareRemarks;

    @Size(max = 2000)
    private String insuranceRemarks;

    private LocalDateTime submittedAt;

    private LocalDateTime reviewedAt;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private Integer aiScore;

    private String aiResult;

    private String aiRemarks;
}
