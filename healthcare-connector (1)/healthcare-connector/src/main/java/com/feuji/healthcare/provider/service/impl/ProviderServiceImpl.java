package com.feuji.healthcare.provider.service.impl;

import com.feuji.healthcare.common.exception.BadRequestException;
import com.feuji.healthcare.common.exception.ResourceNotFoundException;
import com.feuji.healthcare.provider.dto.ProviderRequestDto;
import com.feuji.healthcare.provider.dto.ProviderResponseDto;
import com.feuji.healthcare.provider.entity.ProviderEntity;
import com.feuji.healthcare.provider.repository.ProviderRepository;
import com.feuji.healthcare.provider.service.ProviderService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProviderServiceImpl implements ProviderService {

    private final ProviderRepository providerRepository;

    @Override
    public ProviderResponseDto createProvider(
            ProviderRequestDto request) {

        if (providerRepository.existsByEmail(
                request.getEmail())) {

            throw new BadRequestException(
                    "Provider email already exists");
        }

        ProviderEntity provider = ProviderEntity
                .builder()
                .providerCode(
                        "PROV-" + System.currentTimeMillis())
                .providerName(request.getProviderName())
                .email(request.getEmail())
                .phoneNumber(request.getPhoneNumber())
                .address(request.getAddress())
                .active(true)
                .build();

        ProviderEntity savedProvider =
                providerRepository.save(provider);

        return mapToResponse(savedProvider);
    }

    @Override
    public List<ProviderResponseDto> getAllProviders() {

        return providerRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public ProviderResponseDto getProviderById(Long id) {

        ProviderEntity provider =
                providerRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Provider not found"));

        return mapToResponse(provider);
    }

    private ProviderResponseDto mapToResponse(
            ProviderEntity provider) {

        return ProviderResponseDto.builder()
                .id(provider.getId())
                .providerCode(provider.getProviderCode())
                .providerName(provider.getProviderName())
                .email(provider.getEmail())
                .phoneNumber(provider.getPhoneNumber())
                .address(provider.getAddress())
                .build();
    }
}
