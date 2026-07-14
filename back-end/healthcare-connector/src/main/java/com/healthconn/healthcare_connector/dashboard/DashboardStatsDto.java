package com.healthconn.healthcare_connector.dashboard.dto;

import java.util.List;

/**
 * Dashboard response returned to the frontend.
 */
public record DashboardStatsDto(

        // ==========================================================
        // Overall Dashboard Statistics
        // ==========================================================

        long totalRequests,
        long submitted,
        long underReview,
        long approved,
        long rejected,

        // Pie Chart
        List<StatusCount> statusDistribution,

        // Monthly Bar Chart
        List<MonthlyPriority> monthlyByPriority,

        // Admin Dashboard
        List<ProviderSummary> providerSummary,
        List<PayerSummary> payerSummary

) {

    /**
     * Status distribution for pie chart.
     */
    public record StatusCount(
            String status,
            long count
    ) {
    }

    /**
     * Monthly priority statistics.
     */
    public record MonthlyPriority(
            String month,
            long normal,
            long urgent,
            long emergency
    ) {
    }

    /**
     * Provider summary for admin dashboard.
     */
    public record ProviderSummary(
            String providerName,
            String email,
            long totalSubmitted,
            long approved,
            long rejected,
            long pending
    ) {
    }

    /**
     * Payer summary for admin dashboard.
     */
    public record PayerSummary(
            String payerName,
            String email,
            long totalReviewed,
            long approved,
            long rejected
    ) {
    }

}