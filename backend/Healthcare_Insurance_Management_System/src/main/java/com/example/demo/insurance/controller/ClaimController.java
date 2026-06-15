package com.example.demo.insurance.controller;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.insurance.dto.ClaimDTO;
import com.example.demo.insurance.service.ClaimService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/claims")
public class ClaimController {

    private final ClaimService service;

    public ClaimController(ClaimService service) {
        this.service = service;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ClaimDTO create(@Valid @RequestBody ClaimDTO request) {
        return service.create(request);
    }

    @PutMapping("/{id}")
    public ClaimDTO update(@PathVariable UUID id, @Valid @RequestBody ClaimDTO request) {
        return service.update(id, request);
    }

    @PostMapping("/{id}/submit")
    public ClaimDTO submit(@PathVariable UUID id) {
        return service.submit(id);
    }

    @GetMapping("/{id}")
    public ClaimDTO getById(@PathVariable UUID id) {
        return service.getById(id);
    }

    @GetMapping
    public List<ClaimDTO> listAll() {
        return service.listAll();
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id) {
        service.delete(id);
    }

    @PutMapping("/{id}/approve")
    public ClaimDTO approve(@PathVariable UUID id, @RequestBody(required = false) java.util.Map<String, String> payload) {
        BigDecimal approvedAmount = null;
        String insuranceRemarks = null;
        if (payload != null) {
            String amountStr = payload.get("approvedAmount");
            if (amountStr != null && !amountStr.isBlank()) {
                approvedAmount = new BigDecimal(amountStr);
            }
            insuranceRemarks = payload.get("insuranceRemarks");
        }
        return service.approve(id, approvedAmount, insuranceRemarks);
    }

    @PutMapping("/{id}/reject")
    public ClaimDTO reject(@PathVariable UUID id, @RequestBody(required = false) java.util.Map<String, String> payload) {
        String insuranceRemarks = null;
        if (payload != null) {
            insuranceRemarks = payload.get("insuranceRemarks");
        }
        return service.reject(id, insuranceRemarks);
    }
}
