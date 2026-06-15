package com.example.demo.health_care.controller;

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

import com.example.demo.health_care.dto.PatientDTO;
import com.example.demo.health_care.service.PatientService;

import jakarta.validation.Valid;


@RestController
@RequestMapping("/patients")
public class PatientController {

    private final PatientService patientService;

    public PatientController(PatientService patientService) {
        this.patientService = patientService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PatientDTO create(@Valid @RequestBody PatientDTO request) {
        return patientService.create(request);
    }

    @PutMapping("/{id}")
    public PatientDTO update(@PathVariable UUID id, @Valid @RequestBody PatientDTO request) {
        return patientService.update(id, request);
    }

    @GetMapping("/{id}")
    public PatientDTO getById(@PathVariable UUID id) {
        return patientService.getById(id);
    }

    @GetMapping
    public List<PatientDTO> listAll() {
        return patientService.listAll();
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id) {
        patientService.delete(id);
    }
}

