package com.healthcare.fhir.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.healthcare.fhir.dto.FhirValidationSupportStatus;
import com.healthcare.fhir.validation.FhirValidationSupportService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/fhir/validation")
@RequiredArgsConstructor
public class FhirValidationController {

    private final FhirValidationSupportService validationSupportService;

    @GetMapping("/status")
    public ResponseEntity<FhirValidationSupportStatus> status() {
        return ResponseEntity.ok(validationSupportService.getStatus());
    }
}
