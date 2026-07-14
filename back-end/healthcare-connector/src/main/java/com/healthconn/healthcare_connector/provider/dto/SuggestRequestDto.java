package com.healthconn.healthcare_connector.provider.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * Request payload used for generating AI suggestions
 * for a specific authorization request form field.
 *
 * fieldName  - Name of the field that triggered the suggestion.
 * fieldValue - Current value entered by the user.
 * diagnosisCode, procedureCode and treatmentDescription
 * provide additional context to generate a better suggestion.
 */
public record SuggestRequestDto(

        @NotBlank(message = "Field name is required")
        String fieldName,

        String fieldValue,

        String diagnosisCode,

        String procedureCode,

        String treatmentDescription

) {
}