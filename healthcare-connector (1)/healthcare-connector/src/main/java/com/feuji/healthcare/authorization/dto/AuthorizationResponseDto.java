package com.feuji.healthcare.authorization.dto;

import com.feuji.healthcare.authorization.enums.AuthorizationStatus;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthorizationResponseDto {

    private Long id;

    private String requestNumber;

    private String providerName;

    private String payerName;

    private String patientName;

    private String diagnosis;

    private String procedureCode;

    private BigDecimal requestedAmount;

    private AuthorizationStatus status;

    private String rejectionReason;

}
