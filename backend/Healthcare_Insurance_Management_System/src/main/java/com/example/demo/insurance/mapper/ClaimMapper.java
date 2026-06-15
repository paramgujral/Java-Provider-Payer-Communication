package com.example.demo.insurance.mapper;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import com.example.demo.ai_validation.model.AIValidation;
import com.example.demo.health_care.model.Disease;
import com.example.demo.health_care.model.Patient;
import com.example.demo.insurance.dto.ClaimDTO;
import com.example.demo.insurance.model.Claim;
import com.example.demo.insurance.model.InsurancePolicy;
import com.example.demo.insurance.utils.ClaimStatus;

public class ClaimMapper {

    private ClaimMapper() {
    }

    public static Claim toEntity(ClaimDTO dto) {
        if (dto == null) {
            return null;
        }

        Claim entity = new Claim();
        entity.setId(dto.getId());
        entity.setClaimNumber(dto.getClaimNumber());
        entity.setRequestedAmount(dto.getAmount());
        entity.setApprovedAmount(dto.getApprovedAmount());
        entity.setHealthcareRemarks(dto.getHealthcareRemarks());
        entity.setInsuranceRemarks(dto.getInsuranceRemarks());
        entity.setSubmittedAt(dto.getSubmittedAt());
        entity.setReviewedAt(dto.getReviewedAt());
        if (dto.getStatus() != null) {
            entity.setStatus(ClaimStatus.valueOf(dto.getStatus().toUpperCase()));
        }

        if (dto.getPatientId() != null) {
            Patient patient = new Patient();
            patient.setId(dto.getPatientId());
            entity.setPatient(patient);
        }
        if (dto.getPolicyId() != null) {
            InsurancePolicy policy = new InsurancePolicy();
            policy.setId(dto.getPolicyId());
            entity.setInsurancePolicy(policy);
        }
        if (dto.getDiseaseId() != null) {
            Disease disease = new Disease();
            disease.setId(dto.getDiseaseId());
            entity.setDisease(disease);
        }

        return entity;
    }

    public static ClaimDTO toDto(Claim entity) {
        if (entity == null) {
            return null;
        }

        UUID patientId = entity.getPatient() != null ? entity.getPatient().getId() : null;
        UUID policyId = entity.getInsurancePolicy() != null ? entity.getInsurancePolicy().getId() : null;
        UUID diseaseId = entity.getDisease() != null ? entity.getDisease().getId() : null;

        Integer aiScore = null;
        String aiResult = null;
        String aiRemarks = null;

        if (entity.getAiValidation() != null) {
            aiScore = entity.getAiValidation().getScore();
            aiResult = entity.getAiValidation().getResult();
            aiRemarks = entity.getAiValidation().getRemarks();
        }

        return ClaimDTO.builder()
                .id(entity.getId())
                .claimNumber(entity.getClaimNumber())
                .patientId(patientId)
                .policyId(policyId)
                .diseaseId(diseaseId)
                .amount(entity.getRequestedAmount())
                .remarks(entity.getHealthcareRemarks())
                .status(entity.getStatus() != null ? entity.getStatus().name() : null)
                .requestedAmount(entity.getRequestedAmount())
                .approvedAmount(entity.getApprovedAmount())
                .healthcareRemarks(entity.getHealthcareRemarks())
                .insuranceRemarks(entity.getInsuranceRemarks())
                .submittedAt(entity.getSubmittedAt())
                .reviewedAt(entity.getReviewedAt())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .aiScore(aiScore)
                .aiResult(aiResult)
                .aiRemarks(aiRemarks)
                .build();
    }
}
