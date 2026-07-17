package com.healthcare.auth.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.healthcare.authorization.dto.AuthorizationResponse;
import com.healthcare.authorization.service.AuthorizationService;
import com.healthcare.common.response.ApiResponse;
import com.healthcare.dashboard.dto.DashboardSummary;
import com.healthcare.dashboard.service.DashboardService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/payer")
@RequiredArgsConstructor
public class AuthPayerController {

    private final DashboardService dashboardService;
    private final AuthorizationService authorizationService;

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<DashboardSummary>> dashboard() {
        return ResponseEntity.ok(ApiResponse.<DashboardSummary>builder()
                .success(true)
                .message("Payer dashboard data")
                .data(dashboardService.getSummary())
                .build());
    }

    @GetMapping("/requests")
    public ResponseEntity<ApiResponse<List<AuthorizationResponse>>> requests() {
        return ResponseEntity.ok(ApiResponse.<List<AuthorizationResponse>>builder()
                .success(true)
                .message("Payer queue data")
                .data(authorizationService.getPayerQueue())
                .build());
    }
}
