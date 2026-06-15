package com.example.demo.insurance.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
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
public class InsurancePolicyDTO {

    private UUID id;

    @NotBlank(message = "policyNumber is required")
    @Size(max = 100)
    private String policyNumber;

    @NotNull(message = "coverageAmount is required")
    private BigDecimal coverageAmount;

    private LocalDate startDate;

    private LocalDate endDate;

    @NotNull(message = "patientId is required")
    private UUID patientId;

    @NotNull(message = "insuranceCompanyId is required")
    private UUID insuranceCompanyId;
}
