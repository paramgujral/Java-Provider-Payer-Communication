package com.healthconnect.platform.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ReviewDecisionRequest {

    @NotNull(message = "Decision is required")
    private Decision decision;

    private String reviewerNotes;
    private String denialReason;
    private String additionalInfoRequested;

    public enum Decision {
        APPROVE,
        DENY,
        REQUEST_INFO
    }
}
