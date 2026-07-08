public record DashboardStatsDto(
        long totalRequests,
        long submitted,
        long underReview,
        long approved,
        long rejected,

        List<StatusCount> statusDistribution,
        List<MonthlyPriority> monthlyByPriority,

        List<ProviderSummary> providerSummary,
        List<PayerSummary> payerSummary
) {
    public record StatusCount(String status, long count) {}
    public record MonthlyPriority(String month, long normal, long urgent, long emergency) {}

    public record ProviderSummary(
            String providerName,
            String email,
            long totalSubmitted,
            long approved,
            long rejected,
            long pending
    ) {}

    public record PayerSummary(
            String payerName,
            String email,
            long totalReviewed,
            long approved,
            long rejected
    ) {}
}
