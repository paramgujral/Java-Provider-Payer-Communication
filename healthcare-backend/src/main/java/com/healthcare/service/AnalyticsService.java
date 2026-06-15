package com.healthcare.service;

import com.healthcare.dto.PayerAnalyticsDto;
import com.healthcare.dto.ProviderAnalyticsDto;

public interface AnalyticsService {
    ProviderAnalyticsDto getProviderAnalytics(String providerId);
    PayerAnalyticsDto getPayerAnalytics(String payerId);
}
