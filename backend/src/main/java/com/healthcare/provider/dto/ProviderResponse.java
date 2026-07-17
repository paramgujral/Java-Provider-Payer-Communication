package com.healthcare.provider.dto;

import java.time.LocalDateTime;

import com.healthcare.provider.enums.ProviderStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProviderResponse {
    private Long id;
    private String providerCode;
    private String hospitalName;
    private String specialization;
    private String licenseNumber;
    private String phone;
    private String email;
    private String address;
    private String city;
    private String state;
    private String country;
    private ProviderStatus status;
    private Long userId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
