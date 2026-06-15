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

import com.example.demo.insurance.dto.InsuranceCompanyDTO;
import com.example.demo.insurance.service.InsuranceCompanyService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/insurance-companies")
public class InsuranceCompanyController {

    private final InsuranceCompanyService service;

    public InsuranceCompanyController(InsuranceCompanyService service) {
        this.service = service;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public InsuranceCompanyDTO create(@Valid @RequestBody InsuranceCompanyDTO request) {
        return service.create(request);
    }

    @PutMapping("/{id}")
    public InsuranceCompanyDTO update(@PathVariable UUID id, @Valid @RequestBody InsuranceCompanyDTO request) {
        return service.update(id, request);
    }

    @GetMapping("/{id}")
    public InsuranceCompanyDTO getById(@PathVariable UUID id) {
        return service.getById(id);
    }

    @GetMapping
    public List<InsuranceCompanyDTO> listAll() {
        return service.listAll();
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id) {
        service.delete(id);
    }
}

