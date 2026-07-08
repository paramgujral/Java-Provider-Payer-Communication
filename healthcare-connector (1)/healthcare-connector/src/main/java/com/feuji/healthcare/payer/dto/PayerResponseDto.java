package com.feuji.healthcare.payer.dto;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PayerResponseDto {

    private Long id;

    private String payerCode;

    private String payerName;

    private String email;

    private String phoneNumber;

    private String address;
}
