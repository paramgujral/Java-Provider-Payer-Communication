package com.example.demo.health_care.mapper;

import com.example.demo.health_care.dto.DiseaseDTO;
import com.example.demo.health_care.model.Disease;

public class DiseaseMapper {

    private DiseaseMapper() {
    }

    public static DiseaseDTO toDto(Disease entity) {
        if (entity == null) {
            return null;
        }
        return DiseaseDTO.builder()
                .id(entity.getId())
                .diseaseCode(entity.getDiseaseCode())
                .diseaseName(entity.getDiseaseName())
                .description(entity.getDescription())
                .build();
    }

    public static Disease toEntity(DiseaseDTO dto) {
        if (dto == null) {
            return null;
        }
        Disease entity = new Disease();
        entity.setId(dto.getId());
        entity.setDiseaseCode(dto.getDiseaseCode());
        entity.setDiseaseName(dto.getDiseaseName());
        entity.setDescription(dto.getDescription());
        return entity;
    }
}

