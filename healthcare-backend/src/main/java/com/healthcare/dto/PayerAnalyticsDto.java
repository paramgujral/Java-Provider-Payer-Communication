package com.healthcare.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PayerAnalyticsDto {
    private long totalRequestsReceived;
    private long requestsPendingReview;
    private long requestsProcessed;
    private double averageAiConfidence;
    private double averageTurnaroundTimeHours;
    
    // Breakdowns for charts
    private Map<String, Long> statusBreakdown; // e.g., {"PENDING": 15, "APPROVED": 80}
    private Map<String, Long> urgencyBreakdown; // e.g., {"Emergency": 10, "Routine": 50}
    private Map<String, Long> topProcedures; // e.g., {"99213": 50, "73221": 12}
}
