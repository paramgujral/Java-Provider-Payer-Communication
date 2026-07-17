package com.healthcare.provider.dto;

import com.healthcare.provider.enums.ProviderStatus;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateProviderRequest {

    @NotBlank
    private String providerCode;

    @NotBlank
    private String hospitalName;

    @NotBlank
    private String specialization;

    @NotBlank
    private String licenseNumber;

    @NotBlank
    private String phone;

    @Email
    @NotBlank
    private String email;

    @NotBlank
    private String address;

    @NotBlank
    private String city;

    @NotBlank
    private String state;

    @NotBlank
    private String country;

    @NotNull
    private ProviderStatus status;
}
