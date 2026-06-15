package com.healthcare.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO for creating a new authorization request. Enforces validation rules
 * so incomplete data never reaches the service layer.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthorizationRequestDto {

    @NotBlank(message = "Provider ID is required")
    private String providerId;

    @NotBlank(message = "Payer ID is required")
    private String payerId;

    @NotNull(message = "Patient information is required")
    private PatientInfoDto patientInfo;

    @NotEmpty(message = "At least one diagnosis code (ICD-10) is required")
    private List<String> diagnosisCodes;

    @NotEmpty(message = "At least one procedure code (CPT) is required")
    private List<String> procedureCodes;

    private String serviceType;   // inpatient, outpatient, surgery
    private String urgency;       // routine, urgent, emergency
    private CoverageInfoDto coverageInfo;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PatientInfoDto {
        @NotBlank(message = "Patient Member ID is required")
        private String memberId;

        @NotBlank(message = "Patient first name is required")
        private String firstName;

        @NotBlank(message = "Patient last name is required")
        private String lastName;

        private String dateOfBirth;
        private String gender;
        private String phone;

        public String getFullName() {
            return this.firstName + " " + this.lastName;
        }
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CoverageInfoDto {
        private String insurancePlanId;
        private String groupNumber;
        private String subscriberId;
        private String relationshipToSubscriber;
    }
}
