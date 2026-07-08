package com.feuji.healthcare.payer.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PayerRequestDto {

    private String payerName;

    private String email;

    private String phoneNumber;

    private String address;
}
