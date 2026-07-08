package com.feuji.healthcare.authorization.dto;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class AuthorizationRequestDto {

    private Long providerId;

    private Long payerId;

    private Long patientId;

    private String diagnosis;

    private String procedureCode;

    private BigDecimal requestedAmount;

    private String rejectionReason;
}
