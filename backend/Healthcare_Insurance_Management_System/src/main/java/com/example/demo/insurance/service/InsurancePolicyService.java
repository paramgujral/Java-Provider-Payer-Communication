package com.example.demo.insurance.service;

import java.util.List;
import java.util.UUID;

import com.example.demo.insurance.dto.InsurancePolicyDTO;

public interface InsurancePolicyService {

    InsurancePolicyDTO create(InsurancePolicyDTO request);

    InsurancePolicyDTO update(UUID id, InsurancePolicyDTO request);

    InsurancePolicyDTO getById(UUID id);

    List<InsurancePolicyDTO> listAll();

    void delete(UUID id);
}
