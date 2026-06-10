package com.healthconnect.platform.service;

import com.healthconnect.platform.dto.response.AnalyticsResponse;
import com.healthconnect.platform.dto.response.AnalyticsResponse.ProviderStat;
import com.healthconnect.platform.entity.AuthorizationRequest;
import com.healthconnect.platform.enums.RequestStatus;
import com.healthconnect.platform.repository.AuthorizationRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final AuthorizationRequestRepository requestRepository;

    public AnalyticsResponse getAnalytics() {
        List<AuthorizationRequest> all = requestRepository.findAll();

        long total    = all.size();
        long approved = all.stream().filter(r -> r.getStatus() == RequestStatus.APPROVED).count();
        long denied   = all.stream().filter(r -> r.getStatus() == RequestStatus.DENIED).count();
        long infoReq  = all.stream().filter(r -> r.getStatus() == RequestStatus.INFO_REQUESTED).count();
        long pending  = all.stream().filter(r ->
                r.getStatus() == RequestStatus.SUBMITTED ||
                r.getStatus() == RequestStatus.IN_REVIEW ||
                r.getStatus() == RequestStatus.RESUBMITTED).count();

        double approvalRate = (approved + denied) > 0
                ? Math.round((approved * 100.0 / (approved + denied)) * 10.0) / 10.0 : 0.0;

        // Average turnaround — only resolved requests
        double avgTurnaround = all.stream()
                .filter(r -> r.getSubmittedAt() != null && r.getResolvedAt() != null)
                .mapToLong(r -> Duration.between(r.getSubmittedAt(), r.getResolvedAt()).toHours())
                .average().orElse(0.0);

        // Requests by status
        Map<String, Long> byStatus = all.stream()
                .collect(Collectors.groupingBy(r -> r.getStatus().getDisplayName(), Collectors.counting()));

        // Requests by service type
        Map<String, Long> byServiceType = all.stream()
                .filter(r -> r.getServiceType() != null && !r.getServiceType().isBlank())
                .collect(Collectors.groupingBy(AuthorizationRequest::getServiceType, Collectors.counting()));

        // Requests by priority
        Map<String, Long> byPriority = all.stream()
                .collect(Collectors.groupingBy(AuthorizationRequest::getPriority, Collectors.counting()));

        // Top denial reasons (first 60 chars of each)
        List<String> denialReasons = all.stream()
                .filter(r -> r.getDenialReason() != null && !r.getDenialReason().isBlank())
                .map(r -> r.getDenialReason().length() > 60
                        ? r.getDenialReason().substring(0, 60) + "…"
                        : r.getDenialReason())
                .distinct()
                .limit(5)
                .collect(Collectors.toList());

        // Top providers
        Map<Long, List<AuthorizationRequest>> byProvider = all.stream()
                .collect(Collectors.groupingBy(r -> r.getProvider().getId()));

        List<ProviderStat> topProviders = byProvider.entrySet().stream()
                .map(e -> {
                    List<AuthorizationRequest> reqs = e.getValue();
                    AuthorizationRequest sample = reqs.get(0);
                    long approvedCount = reqs.stream()
                            .filter(r -> r.getStatus() == RequestStatus.APPROVED).count();
                    return new ProviderStat(
                            sample.getProvider().getFullName(),
                            sample.getProvider().getOrganization(),
                            reqs.size(),
                            approvedCount
                    );
                })
                .sorted(Comparator.comparingLong(ProviderStat::getSubmissionCount).reversed())
                .limit(5)
                .collect(Collectors.toList());

        // AI score distribution
        long highScore   = all.stream().filter(r -> r.getAiCompletenessScore() != null && r.getAiCompletenessScore() >= 80).count();
        long mediumScore = all.stream().filter(r -> r.getAiCompletenessScore() != null && r.getAiCompletenessScore() >= 40 && r.getAiCompletenessScore() < 80).count();
        long lowScore    = all.stream().filter(r -> r.getAiCompletenessScore() != null && r.getAiCompletenessScore() < 40).count();

        return AnalyticsResponse.builder()
                .totalRequests(total)
                .totalApproved(approved)
                .totalDenied(denied)
                .totalInfoRequested(infoReq)
                .totalPending(pending)
                .overallApprovalRate(approvalRate)
                .avgTurnaroundHours(Math.round(avgTurnaround * 10.0) / 10.0)
                .requestsByStatus(byStatus)
                .requestsByServiceType(byServiceType)
                .requestsByPriority(byPriority)
                .topDenialReasons(denialReasons)
                .topProviders(topProviders)
                .highScoreCount(highScore)
                .mediumScoreCount(mediumScore)
                .lowScoreCount(lowScore)
                .build();
    }
}
