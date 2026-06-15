package com.example.demo.insurance.controller;

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

import com.example.demo.insurance.dto.InsurancePolicyDTO;
import com.example.demo.insurance.service.InsurancePolicyService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/policies")
public class InsurancePolicyController {

    private final InsurancePolicyService service;

    public InsurancePolicyController(InsurancePolicyService service) {
        this.service = service;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public InsurancePolicyDTO create(@Valid @RequestBody InsurancePolicyDTO request) {
        return service.create(request);
    }

    @PutMapping("/{id}")
    public InsurancePolicyDTO update(@PathVariable UUID id, @Valid @RequestBody InsurancePolicyDTO request) {
        return service.update(id, request);
    }

    @GetMapping("/{id}")
    public InsurancePolicyDTO getById(@PathVariable UUID id) {
        return service.getById(id);
    }

    @GetMapping
    public List<InsurancePolicyDTO> listAll() {
        return service.listAll();
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id) {
        service.delete(id);
    }
}
