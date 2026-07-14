package com.healthconn.healthcare_connector.dashboard.controller;

import com.healthconn.healthcare_connector.dashboard.dto.DashboardStatsDto;
import com.healthconn.healthcare_connector.dashboard.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@Tag(name = "Dashboard APIs")
public class DashboardController {

    private final DashboardService dashboardService;

    @Operation(summary = "Get dashboard statistics")
    @GetMapping("/stats")

    // Uncomment if only authenticated roles should access
    //@PreAuthorize("hasAnyRole('ADMIN','PAYER','PROVIDER','MANAGER')")

    public ResponseEntity<DashboardStatsDto> getStats() {

        return ResponseEntity.ok(
                dashboardService.getStats()
        );

    }
}