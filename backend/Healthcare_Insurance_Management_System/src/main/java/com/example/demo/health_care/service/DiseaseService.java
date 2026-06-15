package com.example.demo.health_care.service;

import java.util.List;
import java.util.UUID;

import com.example.demo.health_care.dto.DiseaseDTO;

public interface DiseaseService {

    DiseaseDTO create(DiseaseDTO request);

    DiseaseDTO update(UUID id, DiseaseDTO request);

    DiseaseDTO getById(UUID id);

    List<DiseaseDTO> listAll();

    void delete(UUID id);
}

