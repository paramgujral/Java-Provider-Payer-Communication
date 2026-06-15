package com.example.demo.insurance.mapper;

import com.example.demo.insurance.dto.InsuranceCompanyDTO;
import com.example.demo.insurance.model.InsuranceCompany;

public class InsuranceCompanyMapper {

    private InsuranceCompanyMapper() {
    }

    public static InsuranceCompanyDTO toDto(InsuranceCompany entity) {
        if (entity == null) {
            return null;
        }
        return InsuranceCompanyDTO.builder()
                .id(entity.getId())
                .companyName(entity.getCompanyName())
                .email(entity.getEmail())
                .phone(entity.getPhone())
                .address(entity.getAddress())
                .active(entity.isActive())
                .build();
    }

    public static InsuranceCompany toEntity(InsuranceCompanyDTO dto) {
        if (dto == null) {
            return null;
        }
        InsuranceCompany entity = new InsuranceCompany();
        entity.setId(dto.getId());
        entity.setCompanyName(dto.getCompanyName());
        entity.setEmail(dto.getEmail());
        entity.setPhone(dto.getPhone());
        entity.setAddress(dto.getAddress());
        entity.setActive(dto.getActive() != null ? dto.getActive() : true);
        return entity;
    }
}

