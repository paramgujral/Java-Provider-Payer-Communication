package com.healthcare.fhir.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.healthcare.fhir.dto.FhirOutboundRequest;
import com.healthcare.fhir.dto.FhirOutboundResponse;
import com.healthcare.fhir.service.FhirOutboundService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/fhir/outbound")
@RequiredArgsConstructor
public class FhirOutboundController {

    private final FhirOutboundService outboundService;

    @PostMapping
    public ResponseEntity<FhirOutboundResponse> sendToPayer(@Valid @RequestBody FhirOutboundRequest request) {
        return ResponseEntity.ok(outboundService.sendToPayer(request));
    }
}
