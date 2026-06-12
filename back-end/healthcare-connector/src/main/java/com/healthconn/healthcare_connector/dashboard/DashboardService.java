package com.healthconn.healthcare_connector.dashboard.service;

import com.healthconn.healthcare_connector.authentication.entity.Role;
import com.healthconn.healthcare_connector.authentication.entity.User;
import com.healthconn.healthcare_connector.authentication.repository.UserRepository;
import com.healthconn.healthcare_connector.dashboard.dto.DashboardStatsDto;
import com.healthconn.healthcare_connector.provider.entity.AuthorizationRequest;
import com.healthconn.healthcare_connector.provider.entity.Priority;
import com.healthconn.healthcare_connector.provider.entity.RequestStatus;
import com.healthconn.healthcare_connector.provider.repository.AuthorizationRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.TextStyle;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final AuthorizationRequestRepository requestRepository;
    private final UserRepository userRepository;

    public DashboardStatsDto getStats() {

        // ── General counts ────────────────────────────
        long total       = requestRepository.count();
        long submitted   = requestRepository.countByStatus(RequestStatus.SUBMITTED);
        long underReview = requestRepository.countByStatus(RequestStatus.UNDER_REVIEW);
        long approved    = requestRepository.countByStatus(RequestStatus.APPROVED);
        long rejected    = requestRepository.countByStatus(RequestStatus.REJECTED);

        // ── Pie chart ─────────────────────────────────
        List<DashboardStatsDto.StatusCount> statusDist = List.of(
                new DashboardStatsDto.StatusCount("Approved",     approved),
                new DashboardStatsDto.StatusCount("Pending",      submitted),
                new DashboardStatsDto.StatusCount("Under Review", underReview),
                new DashboardStatsDto.StatusCount("Rejected",     rejected)
        );

        // ── Bar chart: last 6 months ───────────────────
        List<DashboardStatsDto.MonthlyPriority> monthly = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();
        for (int i = 5; i >= 0; i--) {
            LocalDateTime start = now.minusMonths(i)
                    .withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
            LocalDateTime end = start.plusMonths(1);
            String month = start.getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH);
            monthly.add(new DashboardStatsDto.MonthlyPriority(month,
                    requestRepository.countByPriorityAndCreatedAtBetween(Priority.NORMAL, start, end),
                    requestRepository.countByPriorityAndCreatedAtBetween(Priority.URGENT, start, end),
                    requestRepository.countByPriorityAndCreatedAtBetween(Priority.EMERGENCY, start, end)
            ));
        }

        // ── Admin: per-provider summary ───────────────
        List<User> providers = userRepository.findByRole(Role.PROVIDER);
        List<DashboardStatsDto.ProviderSummary> providerSummary = providers.stream()
                .map(p -> {
                    List<AuthorizationRequest> reqs =
                            requestRepository.findByProviderIdOrderByCreatedAtDesc(p.getId());
                    long pApproved = reqs.stream()
                            .filter(r -> r.getStatus() == RequestStatus.APPROVED).count();
                    long pRejected = reqs.stream()
                            .filter(r -> r.getStatus() == RequestStatus.REJECTED).count();
                    long pPending  = reqs.stream()
                            .filter(r -> r.getStatus() == RequestStatus.SUBMITTED
                                    || r.getStatus() == RequestStatus.UNDER_REVIEW).count();
                    return new DashboardStatsDto.ProviderSummary(
                            p.getFullName(), p.getEmail(),
                            reqs.size(), pApproved, pRejected, pPending);
                }).toList();

        // ── Admin: per-payer summary ──────────────────
        List<User> payers = userRepository.findByRole(Role.PAYER);
        List<DashboardStatsDto.PayerSummary> payerSummary = payers.stream()
                .map(p -> {
                    List<AuthorizationRequest> reviewed =
                            requestRepository.findByReviewedByIdOrderByReviewedAtDesc(p.getId());
                    long pApproved = reviewed.stream()
                            .filter(r -> r.getStatus() == RequestStatus.APPROVED).count();
                    long pRejected = reviewed.stream()
                            .filter(r -> r.getStatus() == RequestStatus.REJECTED).count();
                    return new DashboardStatsDto.PayerSummary(
                            p.getFullName(), p.getEmail(),
                            reviewed.size(), pApproved, pRejected);
                }).toList();

        return new DashboardStatsDto(
                total, submitted, underReview, approved, rejected,
                statusDist, monthly,
                providerSummary, payerSummary
        );
    }
}