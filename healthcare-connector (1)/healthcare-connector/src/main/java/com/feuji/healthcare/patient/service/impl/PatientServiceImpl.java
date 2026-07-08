package com.feuji.healthcare.patient.service.impl;

import com.feuji.healthcare.common.exception.BadRequestException;
import com.feuji.healthcare.common.exception.ResourceNotFoundException;
import com.feuji.healthcare.patient.dto.PatientRequestDto;
import com.feuji.healthcare.patient.dto.PatientResponseDto;
import com.feuji.healthcare.patient.entity.PatientEntity;
import com.feuji.healthcare.patient.repository.PatientRepository;
import com.feuji.healthcare.patient.service.PatientService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PatientServiceImpl implements PatientService {

    private final PatientRepository patientRepository;

    @Override
    public PatientResponseDto createPatient(
            PatientRequestDto request) {

        if (patientRepository.existsByPolicyNumber(
                request.getPolicyNumber())) {

            throw new BadRequestException(
                    "Policy number already exists");
        }

        String patientCode =
                "PAT-" + System.currentTimeMillis();

        PatientEntity patient = PatientEntity.builder()
                .patientCode(patientCode)
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .gender(request.getGender())
                .dateOfBirth(request.getDateOfBirth())
                .email(request.getEmail())
                .phoneNumber(request.getPhoneNumber())
                .policyNumber(request.getPolicyNumber())
                .insurancePlan(request.getInsurancePlan())
                .active(true)
                .build();

        PatientEntity savedPatient =
                patientRepository.save(patient);

        return mapToResponse(savedPatient);
    }

    @Override
    public List<PatientResponseDto> getAllPatients() {

        return patientRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public PatientResponseDto getPatientById(Long id) {

        PatientEntity patient =
                patientRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Patient not found with id : " + id));

        return mapToResponse(patient);
    }

    private PatientResponseDto mapToResponse(
            PatientEntity patient) {

        return PatientResponseDto.builder()
                .id(patient.getId())
                .patientCode(patient.getPatientCode())
                .firstName(patient.getFirstName())
                .lastName(patient.getLastName())
                .gender(patient.getGender())
                .dateOfBirth(patient.getDateOfBirth())
                .email(patient.getEmail())
                .phoneNumber(patient.getPhoneNumber())
                .policyNumber(patient.getPolicyNumber())
                .insurancePlan(patient.getInsurancePlan())
                .build();
    }
}
