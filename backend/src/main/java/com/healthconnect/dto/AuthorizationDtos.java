package com.healthconnect.dto;

import com.healthconnect.model.AuthorizationStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

public class AuthorizationDtos {

    /** Used by Provider to create a new authorization request (FHIR Claim-like payload). */
    @Data
    public static class CreateRequest {
        @NotBlank
        private String patientName;

        @NotBlank
        private String patientDob;

        @NotBlank
        private String patientMemberId;

        @NotBlank
        private String providerNpi;

        @NotBlank
        private String payerOrgName;

        @NotBlank
        private String procedureCode;

        @NotBlank
        private String procedureDescription;

        @NotBlank
        private String diagnosisCode;

        @NotBlank
        private String diagnosisDescription;

        private String requestedServiceDate;

        private String clinicalNotes;

        private Integer unitsRequested;
    }

    /** Used by Payer to update status / respond to a request. */
    @Data
    public static class StatusUpdateRequest {
        @NotNull
        private AuthorizationStatus status;

        private String payerResponseNotes;

        private String approvedUnits;
    }

    /** Response payload returned to clients (FHIR-aligned view of the resource). */
    @Data
    public static class AuthorizationResponse {
        private Long id;
        private String fhirId;
        private String patientName;
        private String patientDob;
        private String patientMemberId;
        private String providerOrgName;
        private String providerNpi;
        private String payerOrgName;
        private String procedureCode;
        private String procedureDescription;
        private String diagnosisCode;
        private String diagnosisDescription;
        private String requestedServiceDate;
        private String clinicalNotes;
        private Integer unitsRequested;
        private AuthorizationStatus status;
        private String payerResponseNotes;
        private String approvedUnits;
        private String aiReviewSummary;
        private Integer aiCompletenessScore;
        private Boolean aiFlaggedIssues;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        private List<HistoryEntry> history;
    }

    @Data
    public static class HistoryEntry {
        private AuthorizationStatus previousStatus;
        private AuthorizationStatus newStatus;
        private String note;
        private String changedByUsername;
        private LocalDateTime changedAt;
    }

    /** Response from the AI Copilot review endpoint. */
    @Data
    public static class CopilotReviewResponse {
        private Integer completenessScore;
        private Boolean flaggedIssues;
        private List<String> issues;
        private List<String> recommendations;
        private String summary;
    }
}
