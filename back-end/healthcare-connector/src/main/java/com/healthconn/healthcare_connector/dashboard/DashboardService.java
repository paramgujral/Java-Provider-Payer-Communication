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
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.TextStyle;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardService {

    private final AuthorizationRequestRepository requestRepository;
    private final UserRepository userRepository;

    public DashboardStatsDto getStats() {

        // ============================================================
        // Overall Request Statistics
        // ============================================================

        final long total = requestRepository.count();
        final long submitted = requestRepository.countByStatus(RequestStatus.SUBMITTED);
        final long underReview = requestRepository.countByStatus(RequestStatus.UNDER_REVIEW);
        final long approved = requestRepository.countByStatus(RequestStatus.APPROVED);
        final long rejected = requestRepository.countByStatus(RequestStatus.REJECTED);

        // ============================================================
        // Status Distribution (Pie Chart)
        // ============================================================

        final List<DashboardStatsDto.StatusCount> statusDistribution = List.of(

                new DashboardStatsDto.StatusCount("Approved", approved),

                new DashboardStatsDto.StatusCount("Pending", submitted),

                new DashboardStatsDto.StatusCount("Under Review", underReview),

                new DashboardStatsDto.StatusCount("Rejected", rejected)

        );

        // ============================================================
        // Monthly Priority Statistics (Last 6 Months)
        // ============================================================

        final List<DashboardStatsDto.MonthlyPriority> monthlyStatistics =
                new ArrayList<>();

        final LocalDateTime now = LocalDateTime.now();

        for (int i = 5; i >= 0; i--) {

            LocalDateTime start = now.minusMonths(i)
                    .withDayOfMonth(1)
                    .withHour(0)
                    .withMinute(0)
                    .withSecond(0)
                    .withNano(0);

            LocalDateTime end = start.plusMonths(1);

            String month =
                    start.getMonth()
                            .getDisplayName(TextStyle.SHORT, Locale.ENGLISH);

            monthlyStatistics.add(

                    new DashboardStatsDto.MonthlyPriority(

                            month,

                            requestRepository.countByPriorityAndCreatedAtBetween(
                                    Priority.NORMAL,
                                    start,
                                    end
                            ),

                            requestRepository.countByPriorityAndCreatedAtBetween(
                                    Priority.URGENT,
                                    start,
                                    end
                            ),

                            requestRepository.countByPriorityAndCreatedAtBetween(
                                    Priority.EMERGENCY,
                                    start,
                                    end
                            )

                    )

            );

        }

        // ============================================================
        // Provider Summary
        // ============================================================

        final List<User> providers =
                userRepository.findByRole(Role.PROVIDER);

        final List<DashboardStatsDto.ProviderSummary> providerSummary =
                providers.stream()

                        .map(provider -> {

                            List<AuthorizationRequest> requests =
                                    requestRepository.findByProviderIdOrderByCreatedAtDesc(
                                            provider.getId()
                                    );

                            long providerApproved =
                                    requests.stream()
                                            .filter(r -> r.getStatus() == RequestStatus.APPROVED)
                                            .count();

                            long providerRejected =
                                    requests.stream()
                                            .filter(r -> r.getStatus() == RequestStatus.REJECTED)
                                            .count();

                            long providerPending =
                                    requests.stream()
                                            .filter(r ->
                                                    r.getStatus() == RequestStatus.SUBMITTED
                                                            || r.getStatus() == RequestStatus.UNDER_REVIEW)
                                            .count();

                            return new DashboardStatsDto.ProviderSummary(

                                    provider.getFullName(),
                                    provider.getEmail(),
                                    requests.size(),
                                    providerApproved,
                                    providerRejected,
                                    providerPending

                            );

                        })

                        .toList();

        // ============================================================
        // Payer Summary
        // ============================================================

        final List<User> payers =
                userRepository.findByRole(Role.PAYER);

        final List<DashboardStatsDto.PayerSummary> payerSummary =
                payers.stream()

                        .map(payer -> {

                            List<AuthorizationRequest> reviewedRequests =
                                    requestRepository.findByReviewedByIdOrderByReviewedAtDesc(
                                            payer.getId()
                                    );

                            long payerApproved =
                                    reviewedRequests.stream()
                                            .filter(r -> r.getStatus() == RequestStatus.APPROVED)
                                            .count();

                            long payerRejected =
                                    reviewedRequests.stream()
                                            .filter(r -> r.getStatus() == RequestStatus.REJECTED)
                                            .count();

                            return new DashboardStatsDto.PayerSummary(

                                    payer.getFullName(),
                                    payer.getEmail(),
                                    reviewedRequests.size(),
                                    payerApproved,
                                    payerRejected

                            );

                        })

                        .toList();

        // ============================================================
        // Response
        // ============================================================

        return new DashboardStatsDto(

                total,
                submitted,
                underReview,
                approved,
                rejected,

                statusDistribution,

                monthlyStatistics,

                providerSummary,

                payerSummary

        );

    }

}