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

import com.example.demo.health_care.dto.DiseaseDTO;
import com.example.demo.health_care.service.DiseaseService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/diseases")
public class DiseaseController {

    private final DiseaseService diseaseService;

    public DiseaseController(DiseaseService diseaseService) {
        this.diseaseService = diseaseService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public DiseaseDTO create(@Valid @RequestBody DiseaseDTO request) {
        return diseaseService.create(request);
    }

    @PutMapping("/{id}")
    public DiseaseDTO update(@PathVariable UUID id, @Valid @RequestBody DiseaseDTO request) {
        return diseaseService.update(id, request);
    }

    @GetMapping("/{id}")
    public DiseaseDTO getById(@PathVariable UUID id) {
        return diseaseService.getById(id);
    }

    @GetMapping
    public List<DiseaseDTO> listAll() {
        return diseaseService.listAll();
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id) {
        diseaseService.delete(id);
    }
}

