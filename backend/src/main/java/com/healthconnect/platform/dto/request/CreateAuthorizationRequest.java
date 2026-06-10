package com.healthconnect.platform.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

import java.time.LocalDate;

@Data
public class CreateAuthorizationRequest {

    // Patient Information
    @NotBlank(message = "Patient name is required")
    private String patientName;

    @NotBlank(message = "Patient date of birth is required")
    private String patientDob;

    @NotBlank(message = "Patient member ID is required")
    private String patientMemberId;

    private String patientInsurancePlan;

    // Clinical Information
    @NotBlank(message = "Diagnosis code is required")
    @Pattern(regexp = "^[A-Z][0-9]{2}(\\.[0-9A-Z]{1,4})?$", message = "Invalid ICD-10 code format")
    private String diagnosisCode;

    @NotBlank(message = "Diagnosis description is required")
    private String diagnosisDescription;

    @NotBlank(message = "Procedure code is required")
    private String procedureCode;

    @NotBlank(message = "Procedure description is required")
    private String procedureDescription;

    @NotBlank(message = "Service type is required")
    private String serviceType;

    @NotNull(message = "Requested service date is required")
    private LocalDate requestedServiceDate;

    @NotNull(message = "Requested service end date is required")
    private LocalDate requestedServiceEndDate;

    private String facilityName;
    private String treatingPhysician;
    private String clinicalNotes;
    private String supportingDocuments;

    private String priority = "NORMAL";
}
