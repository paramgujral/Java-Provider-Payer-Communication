package com.example.demo.insurance.service.impl;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.health_care.exception.exceptions.NotFoundException;
import com.example.demo.insurance.dto.InsuranceCompanyDTO;
import com.example.demo.insurance.mapper.InsuranceCompanyMapper;
import com.example.demo.insurance.model.InsuranceCompany;
import com.example.demo.insurance.repository.InsuranceCompanyRepository;
import com.example.demo.insurance.service.InsuranceCompanyService;

@Service
public class InsuranceCompanyServiceImpl implements InsuranceCompanyService {

    private final InsuranceCompanyRepository repository;

    public InsuranceCompanyServiceImpl(InsuranceCompanyRepository repository) {
        this.repository = repository;
    }

    @Override
    @Transactional
    public InsuranceCompanyDTO create(InsuranceCompanyDTO request) {
        InsuranceCompany saved = repository.save(InsuranceCompanyMapper.toEntity(request));
        return InsuranceCompanyMapper.toDto(saved);
    }

    @Override
    @Transactional
    public InsuranceCompanyDTO update(UUID id, InsuranceCompanyDTO request) {
        InsuranceCompany existing = repository.findById(id)
                .orElseThrow(() -> new NotFoundException("InsuranceCompany not found for id=" + id));

        existing.setCompanyName(request.getCompanyName());
        existing.setEmail(request.getEmail());
        existing.setPhone(request.getPhone());
        existing.setAddress(request.getAddress());
        if (request.getActive() != null) {
            existing.setActive(request.getActive());
        }

        InsuranceCompany saved = repository.save(existing);
        return InsuranceCompanyMapper.toDto(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public InsuranceCompanyDTO getById(UUID id) {
        return repository.findById(id)
                .map(InsuranceCompanyMapper::toDto)
                .orElseThrow(() -> new NotFoundException("InsuranceCompany not found for id=" + id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<InsuranceCompanyDTO> listAll() {
        return repository.findAll().stream().map(InsuranceCompanyMapper::toDto).toList();
    }

    @Override
    @Transactional
    public void delete(UUID id) {
        if (!repository.existsById(id)) {
            throw new NotFoundException("InsuranceCompany not found for id=" + id);
        }
        repository.deleteById(id);
    }
}

