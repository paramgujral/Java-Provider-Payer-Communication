package com.example.demo.insurance.dto;

import java.util.UUID;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InsuranceCompanyDTO {

    private UUID id;

    @NotBlank(message = "companyName is required")
    @Size(max = 255)
    private String companyName;

    @Size(max = 255)
    private String email;

    @Size(max = 50)
    private String phone;

    @Size(max = 1000)
    private String address;

    private Boolean active;
}

