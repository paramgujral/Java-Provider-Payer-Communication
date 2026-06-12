package com.healthconn.healthcare_connector.dashboard.dto;

import java.util.List;

public record DashboardStatsDto(
        // ── General stats (all roles) ─────────────────────
        long totalRequests,
        long submitted,
        long underReview,
        long approved,
        long rejected,

        List<StatusCount> statusDistribution,
        List<MonthlyPriority> monthlyByPriority,

        // ── Admin-only stats ──────────────────────────────
        List<ProviderSummary> providerSummary,
        List<PayerSummary> payerSummary

) {
    public record StatusCount(String status, long count) {}

    public record MonthlyPriority(
            String month, long normal, long urgent, long emergency
    ) {}

    // Per-provider breakdown
    public record ProviderSummary(
            String providerName,
            String email,
            long totalSubmitted,
            long approved,
            long rejected,
            long pending
    ) {}

    // Per-payer breakdown
    public record PayerSummary(
            String payerName,
            String email,
            long totalReviewed,
            long approved,
            long rejected
    ) {}
}