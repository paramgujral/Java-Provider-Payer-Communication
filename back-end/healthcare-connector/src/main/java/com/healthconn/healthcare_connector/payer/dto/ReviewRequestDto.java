package com.healthconn.healthcare_connector.payer.dto;


import com.healthconn.healthcare_connector.provider.entity.RequestStatus;
import jakarta.validation.constraints.NotNull;

public record ReviewRequestDto(
        @NotNull RequestStatus decision,
        String reviewNotes,
        String rejectionReason
) {}