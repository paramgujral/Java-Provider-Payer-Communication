package com.healthconnect.provider.web;

import com.healthconnect.common.model.AuthorizationStatus;
import com.healthconnect.provider.domain.AuthorizationRequest;
import com.healthconnect.provider.repository.AuthorizationRequestRepository;
import com.healthconnect.provider.repository.NotificationRepository;
import com.healthconnect.provider.web.dto.DashboardStatsDto;
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

    private final AuthorizationRequestRepository requests;
    private final NotificationRepository notifications;

    public DashboardController(AuthorizationRequestRepository requests, NotificationRepository notifications) {
        this.requests = requests;
        this.notifications = notifications;
    }

    @GetMapping("/stats")
    public DashboardStatsDto stats() {
        List<AuthorizationRequest> all = requests.findAll();
        Map<String, Long> byStatus = all.stream()
                .collect(Collectors.groupingBy(r -> r.getStatus().name(), Collectors.counting()));
        BigDecimal totalRequested = sumAmounts(all, null);
        BigDecimal approved = sumAmounts(all, AuthorizationStatus.APPROVED);
        return new DashboardStatsDto(all.size(), byStatus, totalRequested, approved,
                notifications.countByReadFalse());
    }

    private BigDecimal sumAmounts(List<AuthorizationRequest> all, AuthorizationStatus status) {
        return all.stream()
                .filter(r -> status == null || r.getStatus() == status)
                .map(AuthorizationRequest::getRequestedAmount)
                .filter(a -> a != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
