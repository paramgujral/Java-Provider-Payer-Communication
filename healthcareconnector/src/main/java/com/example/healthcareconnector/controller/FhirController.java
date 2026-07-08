package com.example.healthcareconnector.controller;

import com.example.healthcareconnector.service.FhirService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/fhir")
public class FhirController {
    private final FhirService fhirService;

    @GetMapping("{id}")
    public ResponseEntity<Map<String, Object>> convertFHIR(@PathVariable Long id){
        return ResponseEntity.ok(fhirService.convertToFHIR(id));
    }
}
