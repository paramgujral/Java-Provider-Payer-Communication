package com.healthconn.healthcare_connector.provider.dto;


import com.healthconn.healthcare_connector.provider.entity.Priority;
import com.healthconn.healthcare_connector.provider.entity.RequestStatus;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record AuthRequestResponseDto(
        Long id,
        String patientName,
        String patientId,
        String insuranceId,
        String providerName,
        Long providerId,
        String diagnosisCode,
        String procedureCode,
        String treatmentDescription,
        LocalDate admissionDate,
        LocalDate expectedDischargeDate,
        Priority priority,
        RequestStatus status,
        String rejectionReason,
        String reviewNotes,
        LocalDateTime createdAt,
        LocalDateTime reviewedAt
) {}