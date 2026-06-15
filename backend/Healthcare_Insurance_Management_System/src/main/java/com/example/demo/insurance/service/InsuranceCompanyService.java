package com.example.demo.insurance.service;

import java.util.List;
import java.util.UUID;

import com.example.demo.insurance.dto.InsuranceCompanyDTO;

public interface InsuranceCompanyService {

    InsuranceCompanyDTO create(InsuranceCompanyDTO request);

    InsuranceCompanyDTO update(UUID id, InsuranceCompanyDTO request);

    InsuranceCompanyDTO getById(UUID id);

    List<InsuranceCompanyDTO> listAll();

    void delete(UUID id);
}

