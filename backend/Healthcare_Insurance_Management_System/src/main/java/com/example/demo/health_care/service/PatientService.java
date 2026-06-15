package com.example.demo.health_care.service;

import java.util.List;
import java.util.UUID;

import com.example.demo.health_care.dto.PatientDTO;

public interface PatientService {

    PatientDTO create(PatientDTO request);

    PatientDTO update(UUID id, PatientDTO request);

    void delete(UUID id);

    PatientDTO getById(UUID id);

    List<PatientDTO> listAll();
}

