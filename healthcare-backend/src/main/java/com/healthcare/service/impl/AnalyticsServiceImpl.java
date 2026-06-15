package com.healthcare.service.impl;

import com.healthcare.dto.PayerAnalyticsDto;
import com.healthcare.dto.ProviderAnalyticsDto;
import com.healthcare.entity.AuthorizationRequest;
import com.healthcare.repository.AuthorizationRequestRepository;
import com.healthcare.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsServiceImpl implements AnalyticsService {

    private final AuthorizationRequestRepository requestRepository;

    @Override
    public ProviderAnalyticsDto getProviderAnalytics(String providerId) {
        List<AuthorizationRequest> requests = requestRepository.findByProviderId(providerId);

        long total = requests.size();
        long pending = requests.stream().filter(r -> "PENDING".equals(r.getStatus().name())).count();
        long approved = requests.stream().filter(r -> "APPROVED".equals(r.getStatus().name())).count();
        long rejected = requests.stream().filter(r -> "REJECTED".equals(r.getStatus().name())).count();
        
        double approvalRate = 0.0;
        long completed = approved + rejected;
        if (completed > 0) {
            approvalRate = (double) approved / completed;
        }

        Map<String, Long> statusBreakdown = requests.stream()
                .collect(Collectors.groupingBy(r -> r.getStatus().name(), Collectors.counting()));

        // Group by Month (e.g. "2023-10")
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM").withZone(ZoneId.systemDefault());
        Map<String, Long> requestsByMonth = requests.stream()
                .filter(r -> r.getCreatedAt() != null)
                .collect(Collectors.groupingBy(r -> formatter.format(r.getCreatedAt()), Collectors.counting()));

        return ProviderAnalyticsDto.builder()
                .totalRequests(total)
                .pendingRequests(pending)
                .approvedRequests(approved)
                .rejectedRequests(rejected)
                .approvalRate(approvalRate)
                .statusBreakdown(statusBreakdown)
                .requestsByMonth(requestsByMonth)
                .build();
    }

    @Override
    public PayerAnalyticsDto getPayerAnalytics(String payerId) {
        List<AuthorizationRequest> requests = requestRepository.findByPayerId(payerId);

        long total = requests.size();
        long pendingReview = requests.stream().filter(r -> "PENDING".equals(r.getStatus().name())).count();
        long processed = requests.stream().filter(r -> "APPROVED".equals(r.getStatus().name()) || "REJECTED".equals(r.getStatus().name())).count();

        double avgAiConfidence = requests.stream()
                .filter(r -> r.getAiConfidenceScore() != null)
                .mapToDouble(AuthorizationRequest::getAiConfidenceScore)
                .average()
                .orElse(0.0);

        Map<String, Long> statusBreakdown = requests.stream()
                .collect(Collectors.groupingBy(r -> r.getStatus().name(), Collectors.counting()));

        Map<String, Long> urgencyBreakdown = requests.stream()
                .filter(r -> r.getUrgency() != null)
                .collect(Collectors.groupingBy(r -> {
                    String u = r.getUrgency().toLowerCase();
                    if (u.contains("emergency")) return "Emergency";
                    if (u.contains("urgent")) return "Urgent";
                    return "Routine";
                }, Collectors.counting()));

        Map<String, Long> topProcedures = new HashMap<>();
        for (AuthorizationRequest req : requests) {
            if (req.getProcedureCodes() != null) {
                for (String code : req.getProcedureCodes()) {
                    topProcedures.put(code, topProcedures.getOrDefault(code, 0L) + 1);
                }
            }
        }

        // Mocking average turnaround time since we don't have historical completion timestamps yet
        double avgTurnaroundTimeHours = 4.2;

        return PayerAnalyticsDto.builder()
                .totalRequestsReceived(total)
                .requestsPendingReview(pendingReview)
                .requestsProcessed(processed)
                .averageAiConfidence(avgAiConfidence)
                .averageTurnaroundTimeHours(avgTurnaroundTimeHours)
                .statusBreakdown(statusBreakdown)
                .urgencyBreakdown(urgencyBreakdown)
                .topProcedures(topProcedures)
                .build();
    }
}
