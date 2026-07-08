package com.feuji.healthcare.provider.service;

import com.feuji.healthcare.provider.dto.ProviderRequestDto;
import com.feuji.healthcare.provider.dto.ProviderResponseDto;

import java.util.List;

public interface ProviderService {

    ProviderResponseDto createProvider(
            ProviderRequestDto request);

    List<ProviderResponseDto> getAllProviders();

    ProviderResponseDto getProviderById(Long id);
}
