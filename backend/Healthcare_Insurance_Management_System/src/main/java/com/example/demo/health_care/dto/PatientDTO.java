package com.example.demo.health_care.dto;

import java.util.UUID;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PatientDTO {

    private UUID id;

    @NotBlank(message = "patientCode is required")
    @Size(max = 255)
    private String patientCode;

    @NotBlank(message = "firstName is required")
    @Size(max = 255)
    private String firstName;

    @NotBlank(message = "lastName is required")
    @Size(max = 255)
    private String lastName;

    @NotNull(message = "age is required")
    @Min(value = 0, message = "age must be >= 0")
    @Max(value = 150, message = "age must be <= 150")
    private Integer age;

    @NotBlank(message = "gender is required")
    @Size(max = 50)
    private String gender;

    @Size(max = 15)
    private String phone;

    @Size(max = 1000)
    private String address;
}

