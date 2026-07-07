package com.healthconnect.payer.domain;

import com.healthconnect.common.model.AuthorizationStatus;
import com.healthconnect.common.model.Urgency;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

/** A prior-authorization case in the payer's review queue. */
@Entity
@Table(name = "prior_auth_cases")
public class PriorAuthCase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String caseNumber;

    /** The provider's request number. */
    @Column(unique = true)
    private String requestNumber;

    // Fields parsed from the FHIR claim
    private String patientFirstName;
    private String patientLastName;
    private LocalDate patientDob;
    private String patientGender;
    private String memberId;
    private String insurancePlan;
    private String providerName;
    private String providerNpi;
    private String diagnosisCode;
    private String diagnosisDescription;
    private String procedureCode;
    private String procedureDescription;
    private LocalDate serviceDate;

    @Enumerated(EnumType.STRING)
    private Urgency urgency = Urgency.ROUTINE;

    @Column(length = 4000)
    private String clinicalJustification;

    private BigDecimal requestedAmount;

    // Review workflow
    @Enumerated(EnumType.STRING)
    private AuthorizationStatus status = AuthorizationStatus.PENDING_REVIEW;

    @Column(length = 2000)
    private String decisionNote;

    /** Comma-separated flags, e.g. HIGH_AMOUNT,EXPEDITE. */
    private String reviewFlags;

    private int resubmissionCount;

    /** The FHIR bundle as received. */
    @Lob
    @Column(length = 100000)
    private String rawBundleJson;

    private Instant receivedAt;
    private Instant updatedAt;
    private Instant decidedAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCaseNumber() { return caseNumber; }
    public void setCaseNumber(String caseNumber) { this.caseNumber = caseNumber; }

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

    public String getDecisionNote() { return decisionNote; }
    public void setDecisionNote(String decisionNote) { this.decisionNote = decisionNote; }

    public String getReviewFlags() { return reviewFlags; }
    public void setReviewFlags(String reviewFlags) { this.reviewFlags = reviewFlags; }

    public int getResubmissionCount() { return resubmissionCount; }
    public void setResubmissionCount(int resubmissionCount) { this.resubmissionCount = resubmissionCount; }

    public String getRawBundleJson() { return rawBundleJson; }
    public void setRawBundleJson(String rawBundleJson) { this.rawBundleJson = rawBundleJson; }

    public Instant getReceivedAt() { return receivedAt; }
    public void setReceivedAt(Instant receivedAt) { this.receivedAt = receivedAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }

    public Instant getDecidedAt() { return decidedAt; }
    public void setDecidedAt(Instant decidedAt) { this.decidedAt = decidedAt; }
}
