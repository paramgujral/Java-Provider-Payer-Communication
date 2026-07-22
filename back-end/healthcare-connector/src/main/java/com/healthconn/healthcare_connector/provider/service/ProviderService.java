package com.healthconn.healthcare_connector.provider.service;


import com.healthconn.healthcare_connector.provider.dto.AuthRequestResponseDto;
import com.healthconn.healthcare_connector.provider.dto.SubmitRequestDto;
import java.util.List;

public interface ProviderService {
    AuthRequestResponseDto createAuthorizationRequest(SubmitRequestDto dto, Long providerId);
    List<AuthRequestResponseDto> getProviderRequests(Long providerId);
}