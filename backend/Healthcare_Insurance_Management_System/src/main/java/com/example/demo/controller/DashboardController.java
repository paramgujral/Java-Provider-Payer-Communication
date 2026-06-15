package com.example.demo.controller;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dto.HealthcareStatsDTO;
import com.example.demo.dto.InsuranceStatsDTO;
import com.example.demo.service.DashboardService;

@RestController
@RequestMapping("/dashboard")
public class DashboardController {

	private final DashboardService dashboardService;

	public DashboardController(DashboardService dashboardService) {
		this.dashboardService = dashboardService;
	}

	@GetMapping("/healthcare")
	@ResponseStatus(HttpStatus.OK)
	public HealthcareStatsDTO getHealthcareStats() {
		return dashboardService.getHealthcareStats();
	}

	@GetMapping("/insurance")
	@ResponseStatus(HttpStatus.OK)
	public InsuranceStatsDTO getInsuranceStats() {
		return dashboardService.getInsuranceStats();
	}
}
