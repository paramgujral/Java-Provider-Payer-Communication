package com.example.demo.dto;



import lombok.*;

import java.util.List;
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AIReviewResponseDTO {
    private boolean passed;
    private String summary;
    private List<String> issues;
    private List<String> suggestions;
    private int confidenceScore;
    private String reviewToken;
}
