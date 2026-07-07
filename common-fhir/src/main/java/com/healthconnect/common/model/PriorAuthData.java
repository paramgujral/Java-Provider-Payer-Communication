package com.healthconnect.common.model;

import java.math.BigDecimal;
import java.time.LocalDate;

/** Plain data holder for a prior-authorization request, used for FHIR mapping. */
public class PriorAuthData {

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
    private Urgency urgency = Urgency.ROUTINE;
    private String clinicalJustification;

    // Financial
    private BigDecimal requestedAmount;

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
}
