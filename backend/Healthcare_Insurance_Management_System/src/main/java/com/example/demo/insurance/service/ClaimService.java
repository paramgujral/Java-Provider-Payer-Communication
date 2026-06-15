package com.example.demo.insurance.service;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import com.example.demo.insurance.dto.ClaimDTO;

public interface ClaimService {

    ClaimDTO create(ClaimDTO request);

    ClaimDTO update(UUID id, ClaimDTO request);

    ClaimDTO submit(UUID id);

    ClaimDTO approve(UUID id, BigDecimal approvedAmount, String insuranceRemarks);

    ClaimDTO reject(UUID id, String insuranceRemarks);

    ClaimDTO getById(UUID id);

    List<ClaimDTO> listAll();

    void delete(UUID id);
}
