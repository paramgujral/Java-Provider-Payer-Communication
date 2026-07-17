package com.healthcare.dashboard.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.healthcare.common.response.ApiResponse;
import com.healthcare.dashboard.dto.DashboardSummary;
import com.healthcare.dashboard.service.DashboardService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping
    public ResponseEntity<ApiResponse<DashboardSummary>> getSummary() {
        return ResponseEntity.ok(ApiResponse.<DashboardSummary>builder()
                .success(true)
                .message("Dashboard data retrieved")
                .data(dashboardService.getSummary())
                .build());
    }
}
