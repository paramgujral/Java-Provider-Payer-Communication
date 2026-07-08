package com.feuji.healthcare.provider.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class ProviderResponseDto {

    private Long id;
    private String providerCode;
    private String providerName;
    private String email;
    private String phoneNumber;
    private String address;
}