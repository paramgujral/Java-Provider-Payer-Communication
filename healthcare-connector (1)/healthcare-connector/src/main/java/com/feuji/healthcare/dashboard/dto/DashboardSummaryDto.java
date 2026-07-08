package com.feuji.healthcare.dashboard.dto;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardSummaryDto {

    private Long totalRequests;

    private Long submittedRequests;

    private Long underReviewRequests;

    private Long approvedRequests;

    private Long rejectedRequests;
}
