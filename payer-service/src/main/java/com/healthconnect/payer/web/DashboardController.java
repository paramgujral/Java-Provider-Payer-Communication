package com.healthconnect.payer.web;

import com.healthconnect.common.model.AuthorizationStatus;
import com.healthconnect.payer.domain.PriorAuthCase;
import com.healthconnect.payer.repository.NotificationRepository;
import com.healthconnect.payer.repository.PriorAuthCaseRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    public record PayerStatsDto(
            long total,
            long pendingReview,
            Map<String, Long> byStatus,
            BigDecimal approvedAmount,
            BigDecimal rejectedAmount,
            long unreadNotifications) {
    }

    private final PriorAuthCaseRepository cases;
    private final NotificationRepository notifications;

    public DashboardController(PriorAuthCaseRepository cases, NotificationRepository notifications) {
        this.cases = cases;
        this.notifications = notifications;
    }

    @GetMapping("/stats")
    public PayerStatsDto stats() {
        List<PriorAuthCase> all = cases.findAll();
        Map<String, Long> byStatus = all.stream()
                .collect(Collectors.groupingBy(c -> c.getStatus().name(), Collectors.counting()));
        return new PayerStatsDto(
                all.size(),
                byStatus.getOrDefault(AuthorizationStatus.PENDING_REVIEW.name(), 0L),
                byStatus,
                sumAmounts(all, AuthorizationStatus.APPROVED),
                sumAmounts(all, AuthorizationStatus.REJECTED),
                notifications.countByReadFalse());
    }

    private BigDecimal sumAmounts(List<PriorAuthCase> all, AuthorizationStatus status) {
        return all.stream()
                .filter(c -> c.getStatus() == status)
                .map(PriorAuthCase::getRequestedAmount)
                .filter(a -> a != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
