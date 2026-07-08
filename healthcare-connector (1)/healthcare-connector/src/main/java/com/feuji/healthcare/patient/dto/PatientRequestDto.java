package com.feuji.healthcare.patient.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class PatientRequestDto {

    private String firstName;

    private String lastName;

    private String gender;

    private LocalDate dateOfBirth;

    private String email;

    private String phoneNumber;

    private String policyNumber;

    private String insurancePlan;
}
