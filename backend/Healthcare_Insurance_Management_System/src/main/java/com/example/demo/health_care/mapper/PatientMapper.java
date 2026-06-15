package com.example.demo.health_care.mapper;

import com.example.demo.health_care.dto.PatientDTO;
import com.example.demo.health_care.model.Patient;

public class PatientMapper {

    private PatientMapper() {
    }

    public static PatientDTO toDto(Patient entity) {
        if (entity == null) {
            return null;
        }
        return PatientDTO.builder()
                .id(entity.getId())
                .patientCode(entity.getPatientCode())
                .firstName(entity.getFirstName())
                .lastName(entity.getLastName())
                .age(entity.getAge())
                .gender(entity.getGender())
                .phone(entity.getPhone())
                .address(entity.getAddress())
                .build();
    }

    public static Patient toEntity(PatientDTO dto) {
        if (dto == null) {
            return null;
        }
        Patient entity = new Patient();
        entity.setId(dto.getId());
        entity.setPatientCode(dto.getPatientCode());
        entity.setFirstName(dto.getFirstName());
        entity.setLastName(dto.getLastName());
        entity.setAge(dto.getAge());
        entity.setGender(dto.getGender());
        entity.setPhone(dto.getPhone());
        entity.setAddress(dto.getAddress());
        return entity;
    }
}

