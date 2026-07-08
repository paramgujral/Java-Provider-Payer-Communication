package com.feuji.healthcare.payer.service;

import com.feuji.healthcare.payer.dto.PayerRequestDto;
import com.feuji.healthcare.payer.dto.PayerResponseDto;

import java.util.List;

public interface PayerService {

    PayerResponseDto createPayer(PayerRequestDto request);

    List<PayerResponseDto> getAllPayers();

    PayerResponseDto getPayerById(Long id);
}