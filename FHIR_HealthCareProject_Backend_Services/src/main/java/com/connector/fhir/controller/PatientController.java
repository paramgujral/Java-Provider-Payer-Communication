package com.connector.fhir.controller;

import com.connector.fhir.model.Patient;
import com.connector.fhir.model.Coverage;
import com.connector.fhir.service.AuthorizationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/patients")
public class PatientController {

    private final AuthorizationService authorizationService;

    public PatientController(AuthorizationService authorizationService) {
        this.authorizationService = authorizationService;
    }

    @GetMapping
    public ResponseEntity<List<Patient>> getPatients() {
        return ResponseEntity.ok(authorizationService.getAllPatients());
    }

    @GetMapping("/{id}/coverages")
    public ResponseEntity<List<Coverage>> getCoverages(@PathVariable Long id) {
        return ResponseEntity.ok(authorizationService.getCoveragesForPatient(id));
    }
}
