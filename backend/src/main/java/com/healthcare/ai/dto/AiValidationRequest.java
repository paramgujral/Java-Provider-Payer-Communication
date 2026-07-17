package com.healthcare.ai.dto;

import java.util.List;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiValidationRequest {

    private String patientName;

    private Integer age;

    private String gender;

    private String insuranceCompany;

    private String memberId;

    private String diagnosis;

    private String icd10;

    private String procedure;

    private String cpt;

    private String physician;

    private String phone;

    private String hospital;

    private List<String> attachments;

}
