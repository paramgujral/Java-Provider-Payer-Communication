package com.healthcare.provider.service;

import com.healthcare.provider.dto.PayerRequestDto;
import com.healthcare.provider.entity.AuthorizationRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
@RequiredArgsConstructor
public class PayerClientService {

    private final RestTemplate restTemplate;

    public void submitToPayer(
            AuthorizationRequest request) {

        PayerRequestDto dto =
                new PayerRequestDto();

        dto.setProviderRequestId(
                request.getId());

        dto.setProviderName(
                request.getProviderName());

        dto.setPatientName(
                request.getPatientName());

        dto.setInsuranceId(
                request.getInsuranceId());

        dto.setDiagnosisCode(
                request.getDiagnosisCode());

        dto.setProcedureCode(
                request.getProcedureCode());

        dto.setClinicalNotes(
                request.getClinicalNotes());

        restTemplate.postForObject(
                "http://localhost:8083/payer/requests",
                dto,
                Object.class);
    }
}