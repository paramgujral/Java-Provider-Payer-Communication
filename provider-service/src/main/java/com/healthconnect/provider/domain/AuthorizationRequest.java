package com.healthconnect.provider.domain;

import com.healthconnect.common.model.AuthorizationStatus;
import com.healthconnect.common.model.Urgency;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

/** A prior-authorization request. */
@Entity
@Table(name = "authorization_requests")
public class AuthorizationRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String requestNumber;

    // Patient
    private String patientFirstName;
    private String patientLastName;
    private LocalDate patientDob;
    private String patientGender;
    private String memberId;

    // Insurance
    private String payerName;
    private String insurancePlan;

    // Requesting provider
    private String providerName;
    private String providerNpi;

    // Clinical
    private String diagnosisCode;
    private String diagnosisDescription;
    private String procedureCode;
    private String procedureDescription;
    private LocalDate serviceDate;

    @Enumerated(EnumType.STRING)
    private Urgency urgency = Urgency.ROUTINE;

    @Column(length = 4000)
    private String clinicalJustification;

    // Financial
    private BigDecimal requestedAmount;

    // Workflow
    @Enumerated(EnumType.STRING)
    private AuthorizationStatus status = AuthorizationStatus.DRAFT;

    private String payerCaseNumber;

    @Column(length = 2000)
    private String payerNote;

    private Instant createdAt;
    private Instant updatedAt;
    private Instant submittedAt;
    private Instant decidedAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getRequestNumber() { return requestNumber; }
    public void setRequestNumber(String requestNumber) { this.requestNumber = requestNumber; }

    public String getPatientFirstName() { return patientFirstName; }
    public void setPatientFirstName(String patientFirstName) { this.patientFirstName = patientFirstName; }

    public String getPatientLastName() { return patientLastName; }
    public void setPatientLastName(String patientLastName) { this.patientLastName = patientLastName; }

    public LocalDate getPatientDob() { return patientDob; }
    public void setPatientDob(LocalDate patientDob) { this.patientDob = patientDob; }

    public String getPatientGender() { return patientGender; }
    public void setPatientGender(String patientGender) { this.patientGender = patientGender; }

    public String getMemberId() { return memberId; }
    public void setMemberId(String memberId) { this.memberId = memberId; }

    public String getPayerName() { return payerName; }
    public void setPayerName(String payerName) { this.payerName = payerName; }

    public String getInsurancePlan() { return insurancePlan; }
    public void setInsurancePlan(String insurancePlan) { this.insurancePlan = insurancePlan; }

    public String getProviderName() { return providerName; }
    public void setProviderName(String providerName) { this.providerName = providerName; }

    public String getProviderNpi() { return providerNpi; }
    public void setProviderNpi(String providerNpi) { this.providerNpi = providerNpi; }

    public String getDiagnosisCode() { return diagnosisCode; }
    public void setDiagnosisCode(String diagnosisCode) { this.diagnosisCode = diagnosisCode; }

    public String getDiagnosisDescription() { return diagnosisDescription; }
    public void setDiagnosisDescription(String diagnosisDescription) { this.diagnosisDescription = diagnosisDescription; }

    public String getProcedureCode() { return procedureCode; }
    public void setProcedureCode(String procedureCode) { this.procedureCode = procedureCode; }

    public String getProcedureDescription() { return procedureDescription; }
    public void setProcedureDescription(String procedureDescription) { this.procedureDescription = procedureDescription; }

    public LocalDate getServiceDate() { return serviceDate; }
    public void setServiceDate(LocalDate serviceDate) { this.serviceDate = serviceDate; }

    public Urgency getUrgency() { return urgency; }
    public void setUrgency(Urgency urgency) { this.urgency = urgency == null ? Urgency.ROUTINE : urgency; }

    public String getClinicalJustification() { return clinicalJustification; }
    public void setClinicalJustification(String clinicalJustification) { this.clinicalJustification = clinicalJustification; }

    public BigDecimal getRequestedAmount() { return requestedAmount; }
    public void setRequestedAmount(BigDecimal requestedAmount) { this.requestedAmount = requestedAmount; }

    public AuthorizationStatus getStatus() { return status; }
    public void setStatus(AuthorizationStatus status) { this.status = status; }

    public String getPayerCaseNumber() { return payerCaseNumber; }
    public void setPayerCaseNumber(String payerCaseNumber) { this.payerCaseNumber = payerCaseNumber; }

    public String getPayerNote() { return payerNote; }
    public void setPayerNote(String payerNote) { this.payerNote = payerNote; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }

    public Instant getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(Instant submittedAt) { this.submittedAt = submittedAt; }

    public Instant getDecidedAt() { return decidedAt; }
    public void setDecidedAt(Instant decidedAt) { this.decidedAt = decidedAt; }
}
