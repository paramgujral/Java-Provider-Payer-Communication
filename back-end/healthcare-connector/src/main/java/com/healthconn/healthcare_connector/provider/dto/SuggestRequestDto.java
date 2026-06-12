package com.healthconn.healthcare_connector.provider.dto;

/**
 * Per-field suggestion request.
 * fieldName  = which form field triggered the blur
 * fieldValue = what the user typed in that field
 * The other 3 fields provide context from the rest of the form.
 */
public record SuggestRequestDto(
        String fieldName,
        String fieldValue,
        String diagnosisCode,
        String procedureCode,
        String treatmentDescription
) {}