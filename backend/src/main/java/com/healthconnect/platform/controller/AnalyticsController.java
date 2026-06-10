package com.healthconnect.platform.controller;

import com.healthconnect.platform.dto.response.AnalyticsResponse;
import com.healthconnect.platform.dto.response.ApiResponse;
import com.healthconnect.platform.service.AnalyticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Analytics", description = "Platform analytics and reporting for payers")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping
    @PreAuthorize("hasRole('PAYER')")
    @Operation(summary = "Get full platform analytics for payer reports page")
    public ResponseEntity<ApiResponse<AnalyticsResponse>> getAnalytics() {
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getAnalytics()));
    }
}
