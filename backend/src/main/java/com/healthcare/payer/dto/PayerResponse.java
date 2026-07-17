package com.healthcare.payer.dto;

import java.time.LocalDateTime;

import com.healthcare.payer.enums.PayerStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PayerResponse {
    private Long id;
    private String payerCode;
    private String companyName;
    private String website;
    private String phone;
    private String email;
    private String address;
    private String city;
    private String state;
    private String country;
    private PayerStatus status;
    private Long userId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
