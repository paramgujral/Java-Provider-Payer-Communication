package com.feuji.healthcare_connector.dto.response;

import java.util.List;

public class ProviderDashboardStats {
    private long totalRequests;
    private long approved;
    private long rejected;
    private long pending;
    private long infoRequested;
    private List<RequestDetailsResponse> recentRequests;

    public ProviderDashboardStats() {}

    public ProviderDashboardStats(long totalRequests, long approved, long rejected, long pending, long infoRequested, List<RequestDetailsResponse> recentRequests) {
        this.totalRequests = totalRequests;
        this.approved = approved;
        this.rejected = rejected;
        this.pending = pending;
        this.infoRequested = infoRequested;
        this.recentRequests = recentRequests;
    }

    public long getTotalRequests() { return totalRequests; }
    public void setTotalRequests(long totalRequests) { this.totalRequests = totalRequests; }

    public long getApproved() { return approved; }
    public void setApproved(long approved) { this.approved = approved; }

    public long getRejected() { return rejected; }
    public void setRejected(long rejected) { this.rejected = rejected; }

    public long getPending() { return pending; }
    public void setPending(long pending) { this.pending = pending; }

    public long getInfoRequested() { return infoRequested; }
    public void setInfoRequested(long infoRequested) { this.infoRequested = infoRequested; }

    public List<RequestDetailsResponse> getRecentRequests() { return recentRequests; }
    public void setRecentRequests(List<RequestDetailsResponse> recentRequests) { this.recentRequests = recentRequests; }
}
