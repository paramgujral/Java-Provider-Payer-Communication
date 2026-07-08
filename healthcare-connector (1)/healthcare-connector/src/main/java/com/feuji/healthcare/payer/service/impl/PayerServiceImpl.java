package com.feuji.healthcare.payer.service.impl;

import com.feuji.healthcare.common.exception.BadRequestException;
import com.feuji.healthcare.common.exception.ResourceNotFoundException;
import com.feuji.healthcare.payer.dto.PayerRequestDto;
import com.feuji.healthcare.payer.dto.PayerResponseDto;
import com.feuji.healthcare.payer.entity.PayerEntity;
import com.feuji.healthcare.payer.repository.PayerRepository;
import com.feuji.healthcare.payer.service.PayerService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PayerServiceImpl implements PayerService {

    private final PayerRepository payerRepository;

    @Override
    public PayerResponseDto createPayer(PayerRequestDto request) {

        if (payerRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Payer email already exists");
        }

        String payerCode = "PAY-" + System.currentTimeMillis();

        PayerEntity payer = PayerEntity.builder()
                .payerCode(payerCode)
                .payerName(request.getPayerName())
                .email(request.getEmail())
                .phoneNumber(request.getPhoneNumber())
                .address(request.getAddress())
                .active(true)
                .build();

        PayerEntity savedPayer = payerRepository.save(payer);

        return mapToResponse(savedPayer);
    }

    @Override
    public List<PayerResponseDto> getAllPayers() {

        return payerRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public PayerResponseDto getPayerById(Long id) {

        PayerEntity payer = payerRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Payer not found with id : " + id));

        return mapToResponse(payer);
    }

    private PayerResponseDto mapToResponse(PayerEntity payer) {

        return PayerResponseDto.builder()
                .id(payer.getId())
                .payerCode(payer.getPayerCode())
                .payerName(payer.getPayerName())
                .email(payer.getEmail())
                .phoneNumber(payer.getPhoneNumber())
                .address(payer.getAddress())
                .build();
    }
}