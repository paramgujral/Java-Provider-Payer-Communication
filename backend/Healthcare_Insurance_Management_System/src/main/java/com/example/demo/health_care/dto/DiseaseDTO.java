package com.example.demo.health_care.dto;

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
public class DiseaseDTO {

    private UUID id;

    @NotBlank(message = "diseaseCode is required")
    @Size(max = 255)
    private String diseaseCode;

    @NotBlank(message = "diseaseName is required")
    @Size(max = 255)
    private String diseaseName;

    @Size(max = 1000)
    private String description;
}

