package com.healthcare.fhir.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.healthcare.fhir.dto.FhirValidationResponse;
import com.healthcare.fhir.service.FhirResourceService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/fhir")
@RequiredArgsConstructor
public class FhirResourceController {

    private final FhirResourceService fhirResourceService;

    @PostMapping(value = "/coverage", consumes = {MediaType.APPLICATION_JSON_VALUE, "application/fhir+json"}, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> createCoverage(@RequestBody String resourceJson,
            @RequestParam(value = "validate", required = false, defaultValue = "false") boolean validate) {
        return create("Coverage", resourceJson, validate);
    }

    @PostMapping(value = "/claim", consumes = {MediaType.APPLICATION_JSON_VALUE, "application/fhir+json"}, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> createClaim(@RequestBody String resourceJson,
            @RequestParam(value = "validate", required = false, defaultValue = "false") boolean validate) {
        return create("Claim", resourceJson, validate);
    }

    @GetMapping(value = "/coverage/{id}", produces = {MediaType.APPLICATION_JSON_VALUE, "application/fhir+json"})
    public ResponseEntity<?> getCoverage(@PathVariable String id) {
        return get(id);
    }

    @GetMapping(value = "/claim/{id}", produces = {MediaType.APPLICATION_JSON_VALUE, "application/fhir+json"})
    public ResponseEntity<?> getClaim(@PathVariable String id) {
        return get(id);
    }

    @PostMapping(value = "/coverage/validate", consumes = {MediaType.APPLICATION_JSON_VALUE, "application/fhir+json"}, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<FhirValidationResponse> validateCoverage(@RequestBody String resourceJson) {
        return ResponseEntity.ok(fhirResourceService.validateResource(resourceJson));
    }

    @PostMapping(value = "/claim/validate", consumes = {MediaType.APPLICATION_JSON_VALUE, "application/fhir+json"}, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<FhirValidationResponse> validateClaim(@RequestBody String resourceJson) {
        return ResponseEntity.ok(fhirResourceService.validateResource(resourceJson));
    }

    private ResponseEntity<?> create(String resourceType, String resourceJson, boolean validate) {
        FhirValidationResponse validation = null;
        if (validate) {
            validation = fhirResourceService.validateResource(resourceJson);
            if (!validation.isValid()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(validation);
            }
        }
        String id = fhirResourceService.createResource(resourceType, resourceJson, validate);
        return ResponseEntity.status(HttpStatus.CREATED).body(new CreateResponse(true, resourceType + " created", id, validation));
    }

    private ResponseEntity<?> get(String id) {
        String resource = fhirResourceService.getResource(id);
        if (resource == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new CreateResponse(false, "Not found", null, null));
        }
        return ResponseEntity.ok(resource);
    }

    static class CreateResponse {
        public boolean success;
        public String message;
        public String id;
        public Object validation;

        public CreateResponse(boolean success, String message, String id, Object validation) {
            this.success = success;
            this.message = message;
            this.id = id;
            this.validation = validation;
        }
    }
}
