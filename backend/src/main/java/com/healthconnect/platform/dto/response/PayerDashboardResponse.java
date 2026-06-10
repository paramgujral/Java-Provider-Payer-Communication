package com.healthconnect.platform.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PayerDashboardResponse {
    private long pendingReviews;
    private long processedToday;
    private long approvedToday;
    private long deniedToday;
    private long infoRequestedCount;
    private double approvalRate;
    private long totalInQueue;
}
