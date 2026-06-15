package com.example.demo.health_care.service.impl;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.health_care.dto.PatientDTO;
import com.example.demo.health_care.exception.exceptions.NotFoundException;
import com.example.demo.health_care.mapper.PatientMapper;
import com.example.demo.health_care.model.Patient;
import com.example.demo.health_care.repository.PatientRepository;
import com.example.demo.health_care.service.PatientService;

@Service
public class PatientServiceImpl implements PatientService {

    private final PatientRepository patientRepository;

    public PatientServiceImpl(PatientRepository patientRepository) {
        this.patientRepository = patientRepository;
    }

    @Override
    @Transactional
    public PatientDTO create(PatientDTO request) {
        Patient entity = PatientMapper.toEntity(request);
        Patient saved = patientRepository.save(entity);
        return PatientMapper.toDto(saved);
    }

    @Override
    @Transactional
    public PatientDTO update(UUID id, PatientDTO request) {
        Patient existing = patientRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Patient not found for id=" + id));

        existing.setPatientCode(request.getPatientCode());
        existing.setFirstName(request.getFirstName());
        existing.setLastName(request.getLastName());
        existing.setAge(request.getAge());
        existing.setGender(request.getGender());
        existing.setPhone(request.getPhone());
        existing.setAddress(request.getAddress());

        Patient saved = patientRepository.save(existing);
        return PatientMapper.toDto(saved);
    }

    @Override
    @Transactional
    public void delete(UUID id) {
        if (!patientRepository.existsById(id)) {
            throw new NotFoundException("Patient not found for id=" + id);
        }
        patientRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public PatientDTO getById(UUID id) {
        Patient existing = patientRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Patient not found for id=" + id));
        return PatientMapper.toDto(existing);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PatientDTO> listAll() {
        return patientRepository.findAll().stream().map(PatientMapper::toDto).toList();
    }
}

