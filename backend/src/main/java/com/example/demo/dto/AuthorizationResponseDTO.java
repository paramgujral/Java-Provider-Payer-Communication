package com.example.demo.dto;


import com.example.demo.model.RequestStatus;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class AuthorizationResponseDTO {
    private Long id;
    private String fhirResourceType;
    private String patientName;
    private String patientDob;
    private String patientMemberId;
    private String diagnosisCode;
    private String procedureCode;
    private String procedureDescription;
    private String clinicalNotes;
    private String serviceStartDate;
    private String serviceEndDate;
    private RequestStatus status;
    private String payerRemarks;
    private String aiReviewNotes;
    private Boolean aiReviewPassed;
    private Long providerId;
    private String providerName;
    private Long payerId;
    private String payerName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
