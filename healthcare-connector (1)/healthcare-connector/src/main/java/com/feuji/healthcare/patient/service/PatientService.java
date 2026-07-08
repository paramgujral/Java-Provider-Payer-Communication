package com.feuji.healthcare.patient.service;

import com.feuji.healthcare.patient.dto.PatientRequestDto;
import com.feuji.healthcare.patient.dto.PatientResponseDto;

import java.util.List;

public interface PatientService {

    PatientResponseDto createPatient(
            PatientRequestDto request);

    List<PatientResponseDto> getAllPatients();

    PatientResponseDto getPatientById(Long id);
}
