package com.healthconn.healthcare_connector.provider.dto;

import com.healthconn.healthcare_connector.provider.entity.Priority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record SubmitRequestDto(
        @NotBlank String patientName,
        @NotBlank String patientId,
        @NotBlank String insuranceId,
        @NotBlank String diagnosisCode,
        @NotBlank String procedureCode,
        String treatmentDescription,
        @NotNull LocalDate admissionDate,
        LocalDate expectedDischargeDate,
        Priority priority
) {}