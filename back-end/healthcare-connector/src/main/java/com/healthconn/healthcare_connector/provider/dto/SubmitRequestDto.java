package com.healthconn.healthcare_connector.provider.dto;

import com.healthconn.healthcare_connector.provider.entity.Priority;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SubmitRequestDto {
    @NotBlank
    private String patientName;
    @NotBlank
    private String patientId;
    @NotBlank
    private String insuranceId;
    @NotBlank
    private String diagnosisCode;
    @NotBlank
    private String procedureCode;
    private String treatmentDescription;
    @NotNull
    private LocalDate admissionDate;
    private LocalDate expectedDischargeDate;
    private Priority priority;
}
