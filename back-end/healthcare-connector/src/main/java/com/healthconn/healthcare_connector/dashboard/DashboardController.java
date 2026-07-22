package com.healthconn.healthcare_connector.dashboard.controller;

import com.healthconn.healthcare_connector.dashboard.service.DashboardService;
import com.healthconn.healthcare_connector.fhir.FhirMapper;
import com.healthconn.healthcare_connector.fhir.FhirMediaTypes;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * FHIR MeasureReport for dashboard statistics.
 */
@RestController
@RequestMapping(produces = {FhirMediaTypes.FHIR_JSON, FhirMediaTypes.JSON})
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;
    private final FhirMapper fhirMapper;

    @GetMapping("/fhir/MeasureReport")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        return ResponseEntity.ok(
                fhirMapper.toMeasureReport(dashboardService.buildDashboardStats()));
    }
}
