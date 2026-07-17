package com.healthcare.payer.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.healthcare.exception.BadRequestException;
import com.healthcare.exception.NotFoundException;
import com.healthcare.payer.dto.CreatePayerRequest;
import com.healthcare.payer.dto.PayerResponse;
import com.healthcare.payer.entity.Payer;
import com.healthcare.payer.repository.PayerRepository;
import com.healthcare.user.entity.User;
import com.healthcare.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PayerService {

    private final PayerRepository payerRepository;
    private final UserRepository userRepository;

    public PayerResponse createPayer(CreatePayerRequest request, Long userId) {
        if (payerRepository.existsByPayerCode(request.getPayerCode())) {
            throw new BadRequestException("Payer code already exists");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        Payer payer = Payer.builder()
                .payerCode(request.getPayerCode())
                .companyName(request.getCompanyName())
                .website(request.getWebsite())
                .phone(request.getPhone())
                .email(request.getEmail())
                .address(request.getAddress())
                .city(request.getCity())
                .state(request.getState())
                .country(request.getCountry())
                .status(request.getStatus())
                .user(user)
                .build();

        return toResponse(payerRepository.save(payer));
    }

    public List<PayerResponse> getAllPayers() {
        return payerRepository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    public PayerResponse getPayerById(Long id) {
        return toResponse(payerRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Payer not found")));
    }

    public PayerResponse updatePayer(Long id, CreatePayerRequest request) {
        Payer payer = payerRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Payer not found"));

        payer.setPayerCode(request.getPayerCode());
        payer.setCompanyName(request.getCompanyName());
        payer.setWebsite(request.getWebsite());
        payer.setPhone(request.getPhone());
        payer.setEmail(request.getEmail());
        payer.setAddress(request.getAddress());
        payer.setCity(request.getCity());
        payer.setState(request.getState());
        payer.setCountry(request.getCountry());
        payer.setStatus(request.getStatus());

        return toResponse(payerRepository.save(payer));
    }

    public void deletePayer(Long id) {
        if (!payerRepository.existsById(id)) {
            throw new NotFoundException("Payer not found");
        }
        payerRepository.deleteById(id);
    }

    private PayerResponse toResponse(Payer payer) {
        return PayerResponse.builder()
                .id(payer.getId())
                .payerCode(payer.getPayerCode())
                .companyName(payer.getCompanyName())
                .website(payer.getWebsite())
                .phone(payer.getPhone())
                .email(payer.getEmail())
                .address(payer.getAddress())
                .city(payer.getCity())
                .state(payer.getState())
                .country(payer.getCountry())
                .status(payer.getStatus())
                .userId(payer.getUser() != null ? payer.getUser().getId() : null)
                .createdAt(payer.getCreatedAt())
                .updatedAt(payer.getUpdatedAt())
                .build();
    }
}
