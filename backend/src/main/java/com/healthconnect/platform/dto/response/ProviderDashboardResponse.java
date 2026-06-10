package com.healthconnect.platform.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProviderDashboardResponse {
    private long totalRequests;
    private long pendingRequests;
    private long approvedRequests;
    private long deniedRequests;
    private long inReviewRequests;
    private long infoRequestedRequests;
    private long draftRequests;
}
