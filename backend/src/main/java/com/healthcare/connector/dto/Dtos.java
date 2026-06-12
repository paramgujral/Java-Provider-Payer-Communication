package com.healthcare.connector.dto;

import lombok.Data;
import java.util.List;
import java.util.Map;

// ─── Auth DTOs ───────────────────────────────────────────────────────────────

@Data
class LoginRequest {
    private String username;
    private String password;
}

@Data
class RegisterRequest {
    private String username;
    private String password;
    private String email;
    private String fullName;
    private String role;       // PROVIDER | PAYER | ADMIN
    private String organization;
    private String npiNumber;
}

@Data
class JwtResponse {
    private String token;
    private String type = "Bearer";
    private Long id;
    private String username;
    private String email;
    private String role;
    private String fullName;
    private String organization;
}

// ─── Authorization DTOs ───────────────────────────────────────────────────────

@Data
class AuthorizationRequestDTO {
    private String patientName;
    private String patientDob;
    private String patientGender;
    private String patientMemberId;
    private String npiNumber;
    private String providerName;
    private String icd10Code;
    private String diagnosisDescription;
    private String cptCode;
    private String procedureDescription;
    private String clinicalNotes;
    private String insuranceId;
    private String insurancePlan;
    private String urgencyLevel;
}

@Data
class PayerReviewRequest {
    private String decision;   // APPROVED | DENIED | INFO_REQUESTED
    private String payerNotes;
    private String clarificationRequested;
}

@Data
class CaseResponse {
    private String caseId;
    private String patientName;
    private String patientDob;
    private String patientGender;
    private String patientMemberId;
    private String npiNumber;
    private String providerName;
    private String icd10Code;
    private String diagnosisDescription;
    private String cptCode;
    private String procedureDescription;
    private String clinicalNotes;
    private String insuranceId;
    private String insurancePlan;
    private String urgencyLevel;
    private Integer aiRiskScore;
    private String aiRiskLevel;
    private String aiAnalysis;
    private String status;
    private String providerUsername;
    private String payerDecision;
    private String payerNotes;
    private String clarificationRequested;
    private String createdAt;
    private String submittedAt;
    private String updatedAt;
}

@Data
class DashboardStats {
    private long totalCases;
    private long draftCases;
    private long pendingCases;
    private long approvedCases;
    private long deniedCases;
    private long infoRequestedCases;
    private double avgRiskScore;
}

// ─── AI DTOs ─────────────────────────────────────────────────────────────────
// (see AiAnalysisResult.java and AuthorizationRequest.java)

// ─── Communication DTOs ───────────────────────────────────────────────────────

@Data
class SendMessageRequest {
    private String caseId;
    private String messageContent;
    private String messageType;
}

@Data
class MessageResponse {
    private Long id;
    private String fhirResourceId;
    private String caseId;
    private String senderUsername;
    private String senderFullName;
    private String senderRole;
    private String messageContent;
    private String messageType;
    private String sentAt;
}

// ─── Notification DTOs ───────────────────────────────────────────────────────

@Data
class NotificationResponse {
    private Long id;
    private String title;
    private String message;
    private String type;
    private String relatedCaseId;
    private Boolean isRead;
    private String createdAt;
}
