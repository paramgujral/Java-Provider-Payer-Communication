package com.healthconn.healthcare_connector.provider.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AiReviewResponseDto {
    private int score;
    private boolean ready;
    private String suggestions;
    private String missingFields;
    private String warnings;
    private String engine;
    private List<FieldGuideDto> fieldSuggestions = new ArrayList<FieldGuideDto>();
}
