package com.healthcare.connector.dto;

import lombok.Data;
import java.util.List;

@Data
public class AIReviewResponse {
    private int completenessScore;
    private List<String> missingFields;
    private List<String> missingDocuments;
    private List<String> recommendations;
}
