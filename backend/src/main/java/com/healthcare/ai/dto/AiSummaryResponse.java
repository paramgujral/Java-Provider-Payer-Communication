package com.healthcare.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiSummaryResponse {
    private String summary;
    private String recommendation;
    private String riskLevel;
    private String missingFields;
}
