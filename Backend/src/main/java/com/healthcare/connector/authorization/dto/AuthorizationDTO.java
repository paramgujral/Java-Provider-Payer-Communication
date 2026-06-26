package com.healthcare.connector.authorization.dto;

import com.healthcare.connector.authorization.enums.AuthorizationStatus;
import com.healthcare.connector.authorization.enums.Priority;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

// ─── Request DTOs ────────────────────────────────────────────────────────────

@Data @Builder @NoArgsConstructor @AllArgsConstructor
class AuthRequest {
    private String patientId;
    private String patientName;
    private String patientDob;
    private String patientMemberId;
    private String patientInsuranceId;
    private String diagnosisCode;
    private String diagnosisDescription;
    private String procedureCode;
    private String procedureDescription;
    private String serviceType;
    private LocalDate requestedStartDate;
    private LocalDate requestedEndDate;
    private Integer numberOfUnits;
    private String placeOfService;
    private String clinicalNotes;
    private Priority priority;
    private String payerOrganizationId;
    private List<String> documentUrls;
}

public class AuthorizationDTO {

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class CreateRequest {
        private String patientId;
        private String patientName;
        private String patientDob;
        private String patientMemberId;
        private String patientInsuranceId;
        private String diagnosisCode;
        private String diagnosisDescription;
        private String procedureCode;
        private String procedureDescription;
        private String serviceType;
        private LocalDate requestedStartDate;
        private LocalDate requestedEndDate;
        private Integer numberOfUnits;
        private String placeOfService;
        private String clinicalNotes;
        private Priority priority;
        private Long payerId;
        private List<String> documentUrls;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class Response {
        private Long id;
        private String referenceNumber;
        private String fhirResourceId;
        // Patient
        private String patientId;
        private String patientName;
        private String patientDob;
        private String patientMemberId;
        private String patientInsuranceId;
        // Provider
        private String providerNpi;
        private String providerName;
        private String facilityName;
        // Payer
        private String payerName;
        private String payerOrganizationId;
        // Clinical
        private String diagnosisCode;
        private String diagnosisDescription;
        private String procedureCode;
        private String procedureDescription;
        private String serviceType;
        private LocalDate requestedStartDate;
        private LocalDate requestedEndDate;
        private Integer numberOfUnits;
        private String placeOfService;
        private String clinicalNotes;
        private Priority priority;
        private List<String> documentUrls;
        // Status
        private AuthorizationStatus status;
        private String statusLabel;
        // AI Review
        private boolean aiReviewed;
        private String aiReviewSummary;
        private Integer aiConfidenceScore;
        private List<String> aiSuggestions;
        // Payer Decision
        private String payerDecision;
        private String payerAuthorizationNumber;
        private String payerDecisionReason;
        private String payerNotes;
        private LocalDate approvedStartDate;
        private LocalDate approvedEndDate;
        private Integer approvedUnits;
        // Timeline
        private LocalDateTime submittedAt;
        private LocalDateTime reviewedAt;
        private LocalDateTime decidedAt;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        private LocalDate expiresAt;
        private Integer versionNumber;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class PayerDecisionRequest {
        private AuthorizationStatus decision;    // APPROVED, DENIED, PARTIALLY_APPROVED, PENDING_INFO
        private String authorizationNumber;
        private String decisionReason;
        private String notes;
        private LocalDate approvedStartDate;
        private LocalDate approvedEndDate;
        private Integer approvedUnits;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class AiReviewResponse {
        private String summary;
        private Integer confidenceScore;
        private List<String> suggestions;
        private List<String> missingInfo;
        private List<String> warnings;
        private boolean readyToSubmit;
        private String fhirComplianceNotes;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class NoteRequest {
        private String content;
        private boolean isInternal;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class NoteResponse {
        private Long id;
        private String authorName;
        private String authorRole;
        private String content;
        private boolean isInternal;
        private boolean isAiGenerated;
        private LocalDateTime createdAt;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class StatusHistoryResponse {
        private AuthorizationStatus fromStatus;
        private AuthorizationStatus toStatus;
        private String changedBy;
        private String changeReason;
        private LocalDateTime changedAt;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class DashboardStats {
        private Long total;
        private Long pending;
        private Long approved;
        private Long denied;
        private Long pendingInfo;
        private Long aiReviewed;
        private Long submitted;
        private Long draft;
    }
}

