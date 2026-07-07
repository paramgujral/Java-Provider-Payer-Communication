package com.healthconnect.provider.web.dto;

import java.math.BigDecimal;
import java.util.Map;

/** Aggregates for the provider dashboard. */
public record DashboardStatsDto(
        long total,
        Map<String, Long> byStatus,
        BigDecimal totalRequestedAmount,
        BigDecimal approvedAmount,
        long unreadNotifications) {
}
