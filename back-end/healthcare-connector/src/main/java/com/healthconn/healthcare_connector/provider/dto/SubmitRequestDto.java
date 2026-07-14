package com.healthconn.healthcare_connector.provider.dto;

import com.healthconn.healthcare_connector.provider.entity.Priority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

/**
 * Request payload for submitting a new authorization request.
 */
public record SubmitRequestDto(

        @NotBlank(message = "Patient name is required")
        String patientName,

        @NotBlank(message = "Patient ID is required")
        String patientId,

        @NotBlank(message = "Insurance ID is required")
        String insuranceId,

        @NotBlank(message = "Diagnosis code is required")
        String diagnosisCode,

        @NotBlank(message = "Procedure code is required")
        String procedureCode,

        String treatmentDescription,

        @NotNull(message = "Admission date is required")
        LocalDate admissionDate,

        LocalDate expectedDischargeDate,

        Priority priority

) {

    /**
     * Returns NORMAL priority when no priority is provided.
     * Does not change the JSON request structure.
     */
    public Priority getPriorityOrDefault() {
        return priority == null ? Priority.NORMAL : priority;
    }

}