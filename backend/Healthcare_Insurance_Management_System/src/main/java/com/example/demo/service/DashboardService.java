package com.example.demo.service;

import com.example.demo.dto.HealthcareStatsDTO;
import com.example.demo.dto.InsuranceStatsDTO;

public interface DashboardService {

	HealthcareStatsDTO getHealthcareStats();

	InsuranceStatsDTO getInsuranceStats();
}
