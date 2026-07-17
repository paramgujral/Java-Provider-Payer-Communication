package com.healthcare.fhir.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.healthcare.fhir.service.PatientService;

import org.springframework.beans.factory.annotation.Autowired;

@RestController
@RequestMapping("/api/fhir/patient")
public class PatientController {

    @Autowired
    private PatientService patientService;

    @PostMapping(consumes = {MediaType.APPLICATION_JSON_VALUE, "application/fhir+json"}, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> createPatient(@RequestBody String resourceJson, @org.springframework.web.bind.annotation.RequestParam(value = "validate", required = false, defaultValue = "false") boolean validate) {
        try {
            com.healthcare.fhir.dto.FhirValidationResponse validation = null;
            if (validate) {
                validation = patientService.validateResource(resourceJson);
                if (!validation.isValid()) {
                    // return validation result without persisting
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(validation);
                }
            }

            String id = patientService.createPatient(resourceJson);
            return ResponseEntity.status(HttpStatus.CREATED).body(new CreateResponse(true, "Patient created", id, validation));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new CreateResponse(false, e.getMessage(), null, null));
        }
    }

    @PostMapping(value = "/validate", consumes = {MediaType.APPLICATION_JSON_VALUE, "application/fhir+json"}, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> validatePatient(@RequestBody String resourceJson) {
        com.healthcare.fhir.dto.FhirValidationResponse resp = patientService.validateResource(resourceJson);
        return ResponseEntity.ok(resp);
    }

    @GetMapping(value = "/{id}", produces = {MediaType.APPLICATION_JSON_VALUE, "application/fhir+json"})
    public ResponseEntity<?> getPatient(@PathVariable String id) {
        String resource = patientService.getPatient(id);
        if (resource == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new CreateResponse(false, "Not found", null, null));
        }
        return ResponseEntity.ok(resource);
    }

    // Simple response DTO
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
