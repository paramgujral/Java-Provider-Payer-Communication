package com.healthcare.authorization.repository;

import java.time.LocalDateTime;

public interface AuthorizationUiProjection {
    Long getId();
    String getRequestNumber();
    Long getProviderId();
    Long getPayerId();
    String getPatientName();
    String getPatientDob();
    String getPatientGender();
    String getPatientPhone();
    String getPatientAddress();
    String getInsuranceCompany();
    String getPolicyNumber();
    String getMemberId();
    String getCoverageType();
    String getDoctorName();
    String getNpiNumber();
    String getHospital();
    String getSpecialty();
    String getDiagnosis();
    String getIcd10Code();
    String getProcedureName();
    String getCptCode();
    String getReasonForAuthorization();
    String getMriReport();
    String getLabReport();
    String getPrescription();
    String getMedicalHistory();
    String getStatus();
    Boolean getFhirValid();
    Integer getAiScore();
    String getAiMissingJson();
    String getAiWarningsJson();
    String getDecisionReason();
    LocalDateTime getSubmittedAt();
    LocalDateTime getUpdatedAt();
}