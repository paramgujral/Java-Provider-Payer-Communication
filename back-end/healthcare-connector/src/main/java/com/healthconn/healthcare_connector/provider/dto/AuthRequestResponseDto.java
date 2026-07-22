package com.healthconn.healthcare_connector.provider.dto;

import com.healthconn.healthcare_connector.provider.entity.Priority;
import com.healthconn.healthcare_connector.provider.entity.RequestStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class AuthRequestResponseDto {
    private final Long id;
    private final String patientName;
    private final String patientId;
    private final String insuranceId;
    private final String providerName;
    private final Long providerId;
    private final String diagnosisCode;
    private final String procedureCode;
    private final String treatmentDescription;
    private final LocalDate admissionDate;
    private final LocalDate expectedDischargeDate;
    private final Priority priority;
    private final RequestStatus status;
    private final String rejectionReason;
    private final String reviewNotes;
    private final LocalDateTime createdAt;
    private final LocalDateTime reviewedAt;
}
