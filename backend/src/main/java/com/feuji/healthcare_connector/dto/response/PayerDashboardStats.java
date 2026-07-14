package com.feuji.healthcare_connector.dto.response;

import java.util.List;

public class PayerDashboardStats {
    private long pendingReview;
    private long approvedToday;
    private long rejectedToday;
    private long totalProcessed;
    private List<RequestDetailsResponse> requestQueue;

    public PayerDashboardStats() {}

    public PayerDashboardStats(long pendingReview, long approvedToday, long rejectedToday, long totalProcessed, List<RequestDetailsResponse> requestQueue) {
        this.pendingReview = pendingReview;
        this.approvedToday = approvedToday;
        this.rejectedToday = rejectedToday;
        this.totalProcessed = totalProcessed;
        this.requestQueue = requestQueue;
    }

    public long getPendingReview() { return pendingReview; }
    public void setPendingReview(long pendingReview) { this.pendingReview = pendingReview; }

    public long getApprovedToday() { return approvedToday; }
    public void setApprovedToday(long approvedToday) { this.approvedToday = approvedToday; }

    public long getRejectedToday() { return rejectedToday; }
    public void setRejectedToday(long rejectedToday) { this.rejectedToday = rejectedToday; }

    public long getTotalProcessed() { return totalProcessed; }
    public void setTotalProcessed(long totalProcessed) { this.totalProcessed = totalProcessed; }

    public List<RequestDetailsResponse> getRequestQueue() { return requestQueue; }
    public void setRequestQueue(List<RequestDetailsResponse> requestQueue) { this.requestQueue = requestQueue; }
}
