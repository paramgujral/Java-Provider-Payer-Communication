package com.feuji.healthcare_connector.entity;

import com.feuji.healthcare_connector.enums.RequestStatus;
import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
@Table(name = "authorization_requests")
public class AuthorizationRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    // FHIR-like identifier
    public String fhirRequestId;

    public String patientName;
    public String memberId;

    public String providerName;
    public String providerNpi;

    public String payerName;
    public String payerId;

    // FHIR Coding-like fields
    public String diagnosisCode;
    public String procedureCode;

    @Column(length = 2000)
    public String clinicalNotes;

    @Enumerated(EnumType.STRING)
    public RequestStatus status;

    @Column(length = 2000)
    public String aiRecommendation;

    @Column(length = 2000)
    public String aiReason;

    public LocalDate createdDate;
    public LocalDate updatedDate;
}