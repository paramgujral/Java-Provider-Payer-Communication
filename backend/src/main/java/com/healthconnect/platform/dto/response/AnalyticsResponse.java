package com.healthconnect.platform.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalyticsResponse {

    // Overall totals
    private long totalRequests;
    private long totalApproved;
    private long totalDenied;
    private long totalInfoRequested;
    private long totalPending;
    private double overallApprovalRate;

    // Average turnaround time in hours
    private double avgTurnaroundHours;

    // Breakdown by status
    private Map<String, Long> requestsByStatus;

    // Breakdown by service type
    private Map<String, Long> requestsByServiceType;

    // Breakdown by priority
    private Map<String, Long> requestsByPriority;

    // Top 5 denial reasons (truncated)
    private List<String> topDenialReasons;

    // Top providers by submission count
    private List<ProviderStat> topProviders;

    // AI score distribution
    private long highScoreCount;    // >= 80
    private long mediumScoreCount;  // 40-79
    private long lowScoreCount;     // < 40

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ProviderStat {
        private String providerName;
        private String organization;
        private long submissionCount;
        private long approvedCount;
    }
}
