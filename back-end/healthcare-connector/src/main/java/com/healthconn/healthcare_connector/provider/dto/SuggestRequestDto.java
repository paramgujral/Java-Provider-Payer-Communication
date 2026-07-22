package com.healthconn.healthcare_connector.provider.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Request payload for a single field suggestion.
 * The extra values provide form context for better suggestions.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SuggestRequestDto {
    private String fieldName;
    private String fieldValue;
    private String diagnosisCode;
    private String procedureCode;
    private String treatmentDescription;
}
