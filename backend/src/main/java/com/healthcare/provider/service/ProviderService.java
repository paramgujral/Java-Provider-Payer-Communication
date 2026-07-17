package com.healthcare.provider.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.healthcare.exception.BadRequestException;
import com.healthcare.exception.NotFoundException;
import com.healthcare.provider.dto.CreateProviderRequest;
import com.healthcare.provider.dto.ProviderResponse;
import com.healthcare.provider.entity.Provider;
import com.healthcare.provider.repository.ProviderRepository;
import com.healthcare.user.entity.User;
import com.healthcare.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProviderService {

    private final ProviderRepository providerRepository;
    private final UserRepository userRepository;

    public ProviderResponse createProvider(CreateProviderRequest request, Long userId) {
        if (providerRepository.existsByProviderCode(request.getProviderCode())) {
            throw new BadRequestException("Provider code already exists");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        Provider provider = Provider.builder()
                .providerCode(request.getProviderCode())
                .hospitalName(request.getHospitalName())
                .specialization(request.getSpecialization())
                .licenseNumber(request.getLicenseNumber())
                .phone(request.getPhone())
                .email(request.getEmail())
                .address(request.getAddress())
                .city(request.getCity())
                .state(request.getState())
                .country(request.getCountry())
                .status(request.getStatus())
                .user(user)
                .build();

        Provider saved = providerRepository.save(provider);
        return toResponse(saved);
    }

    public List<ProviderResponse> getAllProviders() {
        return providerRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public ProviderResponse getProviderById(Long id) {
        Provider provider = providerRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Provider not found"));
        return toResponse(provider);
    }

    public ProviderResponse updateProvider(Long id, CreateProviderRequest request) {
        Provider provider = providerRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Provider not found"));

        provider.setProviderCode(request.getProviderCode());
        provider.setHospitalName(request.getHospitalName());
        provider.setSpecialization(request.getSpecialization());
        provider.setLicenseNumber(request.getLicenseNumber());
        provider.setPhone(request.getPhone());
        provider.setEmail(request.getEmail());
        provider.setAddress(request.getAddress());
        provider.setCity(request.getCity());
        provider.setState(request.getState());
        provider.setCountry(request.getCountry());
        provider.setStatus(request.getStatus());

        return toResponse(providerRepository.save(provider));
    }

    public void deleteProvider(Long id) {
        if (!providerRepository.existsById(id)) {
            throw new NotFoundException("Provider not found");
        }
        providerRepository.deleteById(id);
    }

    private ProviderResponse toResponse(Provider provider) {
        return ProviderResponse.builder()
                .id(provider.getId())
                .providerCode(provider.getProviderCode())
                .hospitalName(provider.getHospitalName())
                .specialization(provider.getSpecialization())
                .licenseNumber(provider.getLicenseNumber())
                .phone(provider.getPhone())
                .email(provider.getEmail())
                .address(provider.getAddress())
                .city(provider.getCity())
                .state(provider.getState())
                .country(provider.getCountry())
                .status(provider.getStatus())
                .userId(provider.getUser() != null ? provider.getUser().getId() : null)
                .createdAt(provider.getCreatedAt())
                .updatedAt(provider.getUpdatedAt())
                .build();
    }
}
