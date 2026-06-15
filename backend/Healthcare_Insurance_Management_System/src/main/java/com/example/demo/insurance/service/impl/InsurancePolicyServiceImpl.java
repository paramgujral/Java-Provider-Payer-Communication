package com.example.demo.insurance.service.impl;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.health_care.exception.exceptions.NotFoundException;
import com.example.demo.insurance.dto.InsurancePolicyDTO;
import com.example.demo.insurance.mapper.InsurancePolicyMapper;
import com.example.demo.insurance.model.InsuranceCompany;
import com.example.demo.insurance.model.InsurancePolicy;
import com.example.demo.insurance.repository.InsurancePolicyRepository;
import com.example.demo.insurance.service.InsurancePolicyService;
import com.example.demo.health_care.model.Patient;
import com.example.demo.health_care.repository.PatientRepository;

import org.springframework.beans.factory.annotation.Autowired;
import com.example.demo.insurance.repository.InsuranceCompanyRepository;

@Service
public class InsurancePolicyServiceImpl implements InsurancePolicyService {

    private final InsurancePolicyRepository repository;

    private final PatientRepository patientRepository;

    private final InsuranceCompanyRepository insuranceCompanyRepository;

    @Autowired
    public InsurancePolicyServiceImpl(
            InsurancePolicyRepository repository,
            PatientRepository patientRepository,
            InsuranceCompanyRepository insuranceCompanyRepository) {
        this.repository = repository;
        this.patientRepository = patientRepository;
        this.insuranceCompanyRepository = insuranceCompanyRepository;
    }

    @Override
    @Transactional
    public InsurancePolicyDTO create(InsurancePolicyDTO request) {
        InsurancePolicy entity = InsurancePolicyMapper.toEntity(request);

        Patient patient = patientRepository.findById(request.getPatientId())
                .orElseThrow(() -> new NotFoundException("Patient not found for id=" + request.getPatientId()));
        InsuranceCompany company = insuranceCompanyRepository.findById(request.getInsuranceCompanyId())
                .orElseThrow(() -> new NotFoundException("InsuranceCompany not found for id=" + request.getInsuranceCompanyId()));

        entity.setPatient(patient);
        entity.setInsuranceCompany(company);

        InsurancePolicy saved = repository.save(entity);
        return InsurancePolicyMapper.toDto(saved);
    }

    @Override
    @Transactional
    public InsurancePolicyDTO update(UUID id, InsurancePolicyDTO request) {
        InsurancePolicy existing = repository.findById(id)
                .orElseThrow(() -> new NotFoundException("InsurancePolicy not found for id=" + id));

        existing.setPolicyNumber(request.getPolicyNumber());
        existing.setCoverageAmount(request.getCoverageAmount());
        existing.setStartDate(request.getStartDate());
        existing.setEndDate(request.getEndDate());

        Patient patient = patientRepository.findById(request.getPatientId())
                .orElseThrow(() -> new NotFoundException("Patient not found for id=" + request.getPatientId()));
        InsuranceCompany company = insuranceCompanyRepository.findById(request.getInsuranceCompanyId())
                .orElseThrow(() -> new NotFoundException("InsuranceCompany not found for id=" + request.getInsuranceCompanyId()));

        existing.setPatient(patient);
        existing.setInsuranceCompany(company);

        InsurancePolicy saved = repository.save(existing);
        return InsurancePolicyMapper.toDto(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public InsurancePolicyDTO getById(UUID id) {
        return repository.findById(id)
                .map(InsurancePolicyMapper::toDto)
                .orElseThrow(() -> new NotFoundException("InsurancePolicy not found for id=" + id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<InsurancePolicyDTO> listAll() {
        return repository.findAll().stream().map(InsurancePolicyMapper::toDto).toList();
    }

    @Override
    @Transactional
    public void delete(UUID id) {
        if (!repository.existsById(id)) {
            throw new NotFoundException("InsurancePolicy not found for id=" + id);
        }
        repository.deleteById(id);
    }
}
