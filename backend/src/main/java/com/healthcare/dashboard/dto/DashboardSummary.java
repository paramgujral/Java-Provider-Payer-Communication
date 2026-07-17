package com.healthcare.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardSummary {
    private long totalRequests;
    private long pending;
    private long approved;
    private long rejected;
    private long pendingReviews;
    private long todaysReviews;
    private double averageReviewTimeHours;
    private double approvalPercentage;
    private long providers;
    private long payers;
    private long users;
    private String systemHealth;
}
