package com.healthconn.healthcare_connector.payer.dto;

import com.healthconn.healthcare_connector.provider.entity.RequestStatus;
import jakarta.validation.constraints.NotNull;

/**
 * Request payload used by a payer to approve or reject
 * an authorization request.
 */
public record ReviewRequestDto(

        @NotNull(message = "Decision is required")
        RequestStatus decision,

        String reviewNotes,

        String rejectionReason

) {
}