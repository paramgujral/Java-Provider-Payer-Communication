package com.healthcare.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiValidationSuggestion {
    private String field;
    private String issue;
    private String suggestion;
    private String example;
}
