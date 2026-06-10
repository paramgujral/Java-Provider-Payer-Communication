package com.connector.auth.dto;

import jakarta.validation.constraints.NotBlank;
import java.util.ArrayList;
import java.util.List;

/** Payload the Provider module sends to create / submit a request. */
public class CreateRequestDto {
    // Patient
    public String patientMrn;
    @NotBlank public String patientName;
    public String patientBirthDate;
    public String patientGender;

    // Coverage
    public String memberId;
    @NotBlank public String payerName;
    public String planName;

    // Provider
    public String providerNpi;
    @NotBlank public String providerName;
    public String providerOrg;
    public String providerSpecialty;

    // Service
    public String priority;
    public String placeOfService;
    public String serviceStart;
    public String serviceEnd;
    public String clinicalNotes;

    public List<DiagnosisDto> diagnoses = new ArrayList<>();
    public List<ServiceLineDto> serviceLines = new ArrayList<>();
}
