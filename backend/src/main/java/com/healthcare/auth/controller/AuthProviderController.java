package com.healthcare.auth.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.healthcare.common.response.ApiResponse;
import com.healthcare.dashboard.dto.DashboardSummary;
import com.healthcare.dashboard.service.DashboardService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/provider")
@RequiredArgsConstructor
public class AuthProviderController {

    private final DashboardService dashboardService;

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<DashboardSummary>> dashboard() {
        return ResponseEntity.ok(ApiResponse.<DashboardSummary>builder()
                .success(true)
                .message("Provider dashboard data")
                .data(dashboardService.getSummary())
                .build());
    }
}
