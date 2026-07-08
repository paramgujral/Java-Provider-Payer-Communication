package com.feuji.healthcare.provider.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProviderRequestDto {

    private String providerName;
    private String email;
    private String phoneNumber;
    private String address;
}
