package com.healthcare.connector.dto;

import com.healthcare.connector.entity.RequestStatus;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class AuthorizationRequestDto {
    private Long id;
    private String patientName;
    private String patientId;
    private String insuranceId;
    private String insuranceProvider;
    private String diagnosis;
    private String procedureName;
    private String clinicalNotes;
    private Double estimatedCost;
    private List<DocumentDto> documents;
    private String status;
    private LocalDateTime requestDate;
    private LocalDateTime lastUpdated;
    private String requestedBy;
    private String approvedBy;
    private String rejectionReason;
    private Long providerId;
    private Long payerId;
}
