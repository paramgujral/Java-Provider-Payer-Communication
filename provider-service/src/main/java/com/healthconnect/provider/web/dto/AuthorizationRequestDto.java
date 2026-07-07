package com.healthconnect.provider.web.dto;

import com.healthconnect.common.model.Urgency;

import java.math.BigDecimal;
import java.time.LocalDate;

/** Create/update payload; drafts may be saved incomplete. */
public record AuthorizationRequestDto(
        String patientFirstName,
        String patientLastName,
        LocalDate patientDob,
        String patientGender,
        String memberId,
        String payerName,
        String insurancePlan,
        String providerName,
        String providerNpi,
        String diagnosisCode,
        String diagnosisDescription,
        String procedureCode,
        String procedureDescription,
        LocalDate serviceDate,
        Urgency urgency,
        String clinicalJustification,
        BigDecimal requestedAmount) {
}
