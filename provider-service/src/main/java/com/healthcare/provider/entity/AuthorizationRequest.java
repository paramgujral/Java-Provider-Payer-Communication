package com.healthcare.provider.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;

@Entity
@Table(name = "authorization_requests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthorizationRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Provider/Hospital Name is required.")
    @Pattern(
            regexp = "^[A-Za-z ]+$",
            message = "Provider/Hospital Name should contain only alphabets and spaces."
    )
    private String providerName;

    @NotBlank(message = "Patient Name is required.")
    @Pattern(
            regexp = "^[A-Za-z ]+$",
            message = "Patient Name should contain only alphabets and spaces."
    )
    private String patientName;

    @NotBlank(message = "Insurance ID is required.")
    @Pattern(
            regexp = "^IN\\d{4}$",
            message = "Insurance ID should follow the format IN1234."
    )
    private String insuranceId;

    @NotBlank(message = "Diagnosis Code is required.")
    @Pattern(
            regexp = "^DC\\d{3}$",
            message = "Diagnosis Code should follow the format DC123."
    )
    private String diagnosisCode;

    @NotBlank(message = "Procedure Code is required.")
    @Pattern(
            regexp = "^PC\\d{3}$",
            message = "Procedure Code should follow the format PC123."
    )
    private String procedureCode;

    @NotBlank(message = "Clinical Notes are required.")
    @Size(
            min = 30,
            message = "Clinical Notes should contain at least 30 characters."
    )
    @Column(length = 3000)
    private String clinicalNotes;

    private String status;

    @Column(length = 3000)
    private String aiRecommendation;
}