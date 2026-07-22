package com.healthconn.healthcare_connector.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
public class DashboardStatsDto {
    private final long totalRequests;
    private final long submitted;
    private final long underReview;
    private final long approved;
    private final long rejected;
    private final List<StatusCount> statusDistribution;
    private final List<MonthlyPriority> monthlyByPriority;
    private final List<ProviderSummary> providerSummary;
    private final List<PayerSummary> payerSummary;

    @Getter
    @AllArgsConstructor
    public static class StatusCount {
        private final String status;
        private final long count;
    }

    @Getter
    @AllArgsConstructor
    public static class MonthlyPriority {
        private final String month;
        private final long normal;
        private final long urgent;
        private final long emergency;
    }

    @Getter
    @AllArgsConstructor
    public static class ProviderSummary {
        private final String providerName;
        private final String email;
        private final long totalSubmitted;
        private final long approved;
        private final long rejected;
        private final long pending;
    }

    @Getter
    @AllArgsConstructor
    public static class PayerSummary {
        private final String payerName;
        private final String email;
        private final long totalReviewed;
        private final long approved;
        private final long rejected;
    }
}
