package com.healthcare.ai.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiValidationResponse {
    private boolean valid;
    private List<String> issues;
    private List<AiValidationSuggestion> suggestions;
}
