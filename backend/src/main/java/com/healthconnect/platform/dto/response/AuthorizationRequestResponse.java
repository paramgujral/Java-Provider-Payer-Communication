package com.healthconnect.platform.dto.response;

import com.healthconnect.platform.enums.RequestStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthorizationRequestResponse {

    private Long id;
    private String referenceNumber;

    // Patient
    private String patientName;
    private String patientDob;
    private String patientMemberId;
    private String patientInsurancePlan;

    // Clinical
    private String diagnosisCode;
    private String diagnosisDescription;
    private String procedureCode;
    private String procedureDescription;
    private String serviceType;
    private LocalDate requestedServiceDate;
    private LocalDate requestedServiceEndDate;
    private String facilityName;
    private String treatingPhysician;
    private String clinicalNotes;
    private String supportingDocuments;

    // AI
    private Integer aiCompletenessScore;
    private Integer aiApprovalProbability;
    private List<String> aiRecommendations;

    // Review
    private String reviewerNotes;
    private String denialReason;
    private String additionalInfoRequested;

    // Workflow
    private RequestStatus status;
    private String statusDisplayName;
    private String priority;

    // Relations
    private Long providerId;
    private String providerName;
    private String providerOrganization;
    private Long reviewerId;
    private String reviewerName;

    // Timestamps
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime submittedAt;
    private LocalDateTime reviewedAt;
    private LocalDateTime resolvedAt;
}
