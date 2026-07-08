package com.feuji.healthcare.dashboard.controller;

import com.feuji.healthcare.common.response.ApiResponse;
import com.feuji.healthcare.dashboard.dto.DashboardSummaryDto;
import com.feuji.healthcare.dashboard.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/summary")
    @PreAuthorize("hasAnyRole('ADMIN','PROVIDER','PAYER')")
    public ResponseEntity<ApiResponse<DashboardSummaryDto>>
    getSummary() {

        return ResponseEntity.ok(
                ApiResponse.<DashboardSummaryDto>builder()
                        .success(true)
                        .message("Dashboard Summary Fetched Successfully")
                        .data(
                                dashboardService.getSummary())
                        .build()
        );
    }
}