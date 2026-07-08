package com.feuji.healthcare.patient.dto;

import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PatientResponseDto {

    private Long id;

    private String patientCode;

    private String firstName;

    private String lastName;

    private String gender;

    private LocalDate dateOfBirth;

    private String email;

    private String phoneNumber;

    private String policyNumber;

    private String insurancePlan;
}
