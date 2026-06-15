package com.example.demo.insurance.mapper;

import java.util.UUID;

import com.example.demo.health_care.model.Patient;
import com.example.demo.insurance.dto.InsurancePolicyDTO;
import com.example.demo.insurance.model.InsuranceCompany;
import com.example.demo.insurance.model.InsurancePolicy;

public class InsurancePolicyMapper {

    private InsurancePolicyMapper() {
    }

    public static InsurancePolicy toEntity(InsurancePolicyDTO dto) {
        if (dto == null) {
            return null;
        }

        InsurancePolicy entity = new InsurancePolicy();
        entity.setId(dto.getId());
        entity.setPolicyNumber(dto.getPolicyNumber());
        entity.setCoverageAmount(dto.getCoverageAmount());
        entity.setStartDate(dto.getStartDate());
        entity.setEndDate(dto.getEndDate());

        if (dto.getPatientId() != null) {
            Patient patient = new Patient();
            patient.setId(dto.getPatientId());
            entity.setPatient(patient);
        }

        if (dto.getInsuranceCompanyId() != null) {
            InsuranceCompany company = new InsuranceCompany();
            company.setId(dto.getInsuranceCompanyId());
            entity.setInsuranceCompany(company);
        }

        return entity;
    }

    public static InsurancePolicyDTO toDto(InsurancePolicy entity) {
        if (entity == null) {
            return null;
        }

        UUID patientId = entity.getPatient() != null ? entity.getPatient().getId() : null;
        UUID companyId = entity.getInsuranceCompany() != null ? entity.getInsuranceCompany().getId() : null;

        return InsurancePolicyDTO.builder()
                .id(entity.getId())
                .policyNumber(entity.getPolicyNumber())
                .coverageAmount(entity.getCoverageAmount())
                .startDate(entity.getStartDate())
                .endDate(entity.getEndDate())
                .patientId(patientId)
                .insuranceCompanyId(companyId)
                .build();
    }
}
