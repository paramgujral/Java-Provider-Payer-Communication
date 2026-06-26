package com.healthcare.payer.service;

import com.healthcare.payer.dto.ProviderStatusRequest;
import com.healthcare.payer.entity.PayerRequest;
import com.healthcare.payer.repository.PayerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PayerService {

    private final PayerRepository repository;
    private final RestTemplate restTemplate;

    public PayerRequest save(
            PayerRequest request) {

        request.setStatus("UNDER_REVIEW");

        PayerRequest savedRequest =
                repository.save(request);

        ProviderStatusRequest dto =
                new ProviderStatusRequest();

        dto.setStatus("UNDER_REVIEW");

        dto.setComments(
                "Authorization request submitted and awaiting review");

        restTemplate.put(
                "http://localhost:8081/provider/requests/"
                        + request.getProviderRequestId()
                        + "/status",
                dto);

        return savedRequest;
    }

    public List<PayerRequest> getAll() {

        return repository.findAll();
    }

    public PayerRequest approve(
            Long id) {

        PayerRequest request =
                repository.findById(id)
                        .orElseThrow();

        request.setStatus("APPROVED");

        request.setComments(
                "Authorization Approved");

        ProviderStatusRequest dto =
                new ProviderStatusRequest();

        dto.setStatus("APPROVED");
        dto.setComments("Authorization Approved");

        restTemplate.put(
                "http://localhost:8081/provider/requests/"
                        + request.getProviderRequestId()
                        + "/status",
                dto);

        return repository.save(request);
    }

    public PayerRequest reject(
            Long id,
            String comments) {

        PayerRequest request =
                repository.findById(id)
                        .orElseThrow();

        request.setStatus("REJECTED");

        request.setComments(comments);

        ProviderStatusRequest dto =
                new ProviderStatusRequest();

        dto.setStatus("REJECTED");
        dto.setComments(comments);

        restTemplate.put(
                "http://localhost:8081/provider/requests/"
                        + request.getProviderRequestId()
                        + "/status",
                dto);

        return repository.save(request);
    }
}