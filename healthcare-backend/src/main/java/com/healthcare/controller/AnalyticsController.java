package com.healthcare.controller;

import com.healthcare.dto.PayerAnalyticsDto;
import com.healthcare.dto.ProviderAnalyticsDto;
import com.healthcare.service.AnalyticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/analytics")
@RequiredArgsConstructor
@Tag(name = "Analytics API", description = "Endpoints for retrieving dashboard analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @Operation(summary = "Get analytics for a specific provider")
    @GetMapping("/provider/{providerId}")
    public ResponseEntity<ProviderAnalyticsDto> getProviderAnalytics(@PathVariable String providerId) {
        return ResponseEntity.ok(analyticsService.getProviderAnalytics(providerId));
    }

    @Operation(summary = "Get analytics for a specific payer")
    @GetMapping("/payer/{payerId}")
    public ResponseEntity<PayerAnalyticsDto> getPayerAnalytics(@PathVariable String payerId) {
        return ResponseEntity.ok(analyticsService.getPayerAnalytics(payerId));
    }
}
