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
public class ProviderAnalyticsDto {
    private long totalRequests;
    private long pendingRequests;
    private long approvedRequests;
    private long rejectedRequests;
    private double approvalRate;
    
    // Breakdowns for charts
    private Map<String, Long> statusBreakdown; // e.g., {"PENDING": 10, "APPROVED": 45}
    private Map<String, Long> requestsByMonth; // e.g., {"Jan": 12, "Feb": 18}
}
