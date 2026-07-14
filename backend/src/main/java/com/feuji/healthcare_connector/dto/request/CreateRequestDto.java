package com.feuji.healthcare_connector.dto.request;

import com.feuji.healthcare_connector.enums.PlaceOfService;
import com.feuji.healthcare_connector.enums.RequestStatus;
import com.feuji.healthcare_connector.enums.SubscriberRelationship;
import com.feuji.healthcare_connector.enums.Urgency;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;

public class CreateRequestDto {

    @NotNull(message = "Payer ID is required")
    private Long payerId;

    @NotBlank(message = "Patient first name is required")
    @Size(min = 2, max = 100)
    private String patientFirstName;

    @NotBlank(message = "Patient last name is required")
    @Size(min = 2, max = 100)
    private String patientLastName;

    @NotNull(message = "Patient date of birth is required")
    private LocalDate patientDob;

    @NotBlank(message = "Patient gender is required")
    private String patientGender;

    @NotBlank(message = "Patient phone is required")
    private String patientPhone;

    private String patientEmail;

    @NotBlank(message = "Patient address is required")
    private String patientAddress;

    @NotBlank(message = "Insurance policy number is required")
    private String insurancePolicyNumber;

    private String insuranceGroupNumber;

    @NotBlank(message = "Subscriber name is required")
    private String subscriberName;

    @NotNull(message = "Subscriber relationship is required")
    private SubscriberRelationship subscriberRelationship;

    @NotNull(message = "Coverage start date is required")
    private LocalDate coverageStartDate;

    private LocalDate coverageEndDate;

    @NotBlank(message = "Primary diagnosis code is required")
    private String primaryDiagnosisCode;

    @NotBlank(message = "Primary diagnosis description is required")
    private String primaryDiagnosisDesc;

    private String secondaryDiagnosisCode;
    private String secondaryDiagnosisDesc;

    @NotBlank(message = "Procedure CPT code is required")
    private String procedureCode;

    @NotBlank(message = "Procedure description is required")
    private String procedureDescription;

    @NotNull(message = "Estimated cost is required")
    @Positive(message = "Estimated cost must be greater than zero")
    private BigDecimal estimatedCost;

    @NotNull(message = "Service date is required")
    private LocalDate serviceDate;

    @NotNull(message = "Urgency level is required")
    private Urgency urgency;

    @NotNull(message = "Place of service is required")
    private PlaceOfService placeOfService;

    @NotBlank(message = "Clinical notes are required")
    @Size(min = 20, message = "Clinical notes must be at least 20 characters")
    private String clinicalNotes;

    private RequestStatus status; // defaults to DRAFT or SUBMITTED depending on save/submit action

    public CreateRequestDto() {}

    public Long getPayerId() { return payerId; }
    public void setPayerId(Long payerId) { this.payerId = payerId; }

    public String getPatientFirstName() { return patientFirstName; }
    public void setPatientFirstName(String patientFirstName) { this.patientFirstName = patientFirstName; }

    public String getPatientLastName() { return patientLastName; }
    public void setPatientLastName(String patientLastName) { this.patientLastName = patientLastName; }

    public LocalDate getPatientDob() { return patientDob; }
    public void setPatientDob(LocalDate patientDob) { this.patientDob = patientDob; }

    public String getPatientGender() { return patientGender; }
    public void setPatientGender(String patientGender) { this.patientGender = patientGender; }

    public String getPatientPhone() { return patientPhone; }
    public void setPatientPhone(String patientPhone) { this.patientPhone = patientPhone; }

    public String getPatientEmail() { return patientEmail; }
    public void setPatientEmail(String patientEmail) { this.patientEmail = patientEmail; }

    public String getPatientAddress() { return patientAddress; }
    public void setPatientAddress(String patientAddress) { this.patientAddress = patientAddress; }

    public String getInsurancePolicyNumber() { return insurancePolicyNumber; }
    public void setInsurancePolicyNumber(String insurancePolicyNumber) { this.insurancePolicyNumber = insurancePolicyNumber; }

    public String getInsuranceGroupNumber() { return insuranceGroupNumber; }
    public void setInsuranceGroupNumber(String insuranceGroupNumber) { this.insuranceGroupNumber = insuranceGroupNumber; }

    public String getSubscriberName() { return subscriberName; }
    public void setSubscriberName(String subscriberName) { this.subscriberName = subscriberName; }

    public SubscriberRelationship getSubscriberRelationship() { return subscriberRelationship; }
    public void setSubscriberRelationship(SubscriberRelationship subscriberRelationship) { this.subscriberRelationship = subscriberRelationship; }

    public LocalDate getCoverageStartDate() { return coverageStartDate; }
    public void setCoverageStartDate(LocalDate coverageStartDate) { this.coverageStartDate = coverageStartDate; }

    public LocalDate getCoverageEndDate() { return coverageEndDate; }
    public void setCoverageEndDate(LocalDate coverageEndDate) { this.coverageEndDate = coverageEndDate; }

    public String getPrimaryDiagnosisCode() { return primaryDiagnosisCode; }
    public void setPrimaryDiagnosisCode(String primaryDiagnosisCode) { this.primaryDiagnosisCode = primaryDiagnosisCode; }

    public String getPrimaryDiagnosisDesc() { return primaryDiagnosisDesc; }
    public void setPrimaryDiagnosisDesc(String primaryDiagnosisDesc) { this.primaryDiagnosisDesc = primaryDiagnosisDesc; }

    public String getSecondaryDiagnosisCode() { return secondaryDiagnosisCode; }
    public void setSecondaryDiagnosisCode(String secondaryDiagnosisCode) { this.secondaryDiagnosisCode = secondaryDiagnosisCode; }

    public String getSecondaryDiagnosisDesc() { return secondaryDiagnosisDesc; }
    public void setSecondaryDiagnosisDesc(String secondaryDiagnosisDesc) { this.secondaryDiagnosisDesc = secondaryDiagnosisDesc; }

    public String getProcedureCode() { return procedureCode; }
    public void setProcedureCode(String procedureCode) { this.procedureCode = procedureCode; }

    public String getProcedureDescription() { return procedureDescription; }
    public void setProcedureDescription(String procedureDescription) { this.procedureDescription = procedureDescription; }

    public BigDecimal getEstimatedCost() { return estimatedCost; }
    public void setEstimatedCost(BigDecimal estimatedCost) { this.estimatedCost = estimatedCost; }

    public LocalDate getServiceDate() { return serviceDate; }
    public void setServiceDate(LocalDate serviceDate) { this.serviceDate = serviceDate; }

    public Urgency getUrgency() { return urgency; }
    public void setUrgency(Urgency urgency) { this.urgency = urgency; }

    public PlaceOfService getPlaceOfService() { return placeOfService; }
    public void setPlaceOfService(PlaceOfService placeOfService) { this.placeOfService = placeOfService; }

    public String getClinicalNotes() { return clinicalNotes; }
    public void setClinicalNotes(String clinicalNotes) { this.clinicalNotes = clinicalNotes; }

    public RequestStatus getStatus() { return status; }
    public void setStatus(RequestStatus status) { this.status = status; }
}
