package com.healthconn.healthcare_connector.provider.service;


import com.healthconn.healthcare_connector.provider.dto.AuthRequestResponseDto;
import com.healthconn.healthcare_connector.provider.dto.SubmitRequestDto;
import java.util.List;

public interface ProviderService {
    AuthRequestResponseDto submitRequest(SubmitRequestDto dto, Long providerId);
    List<AuthRequestResponseDto> getMyRequests(Long providerId);
}