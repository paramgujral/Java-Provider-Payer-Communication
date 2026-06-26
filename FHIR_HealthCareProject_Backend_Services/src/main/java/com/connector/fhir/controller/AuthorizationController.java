package com.connector.fhir.controller;

import com.connector.fhir.dto.AuthorizationRequestDto;
import com.connector.fhir.dto.MessageDto;
import com.connector.fhir.model.AuthorizationRequest;
import com.connector.fhir.model.Message;
import com.connector.fhir.model.StatusHistory;
import com.connector.fhir.service.AuthorizationService;
import com.connector.fhir.service.FHIRValidationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/authorization")
public class AuthorizationController {

    private final AuthorizationService authorizationService;
    private final FHIRValidationService fhirValidationService;

    public AuthorizationController(AuthorizationService authorizationService, FHIRValidationService fhirValidationService) {
        this.authorizationService = authorizationService;
        this.fhirValidationService = fhirValidationService;
    }

    @PostMapping
    public ResponseEntity<?> create(@Valid @RequestBody AuthorizationRequestDto dto) {
        try {
            // Pre-submit FHIR Validation
            String mockFhir = generateMockFhir(dto);
            List<String> fhirErrors = fhirValidationService.validateClaim(mockFhir);
            if (!fhirErrors.isEmpty()) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "FHIR Validation Failed");
                errorResponse.put("details", fhirErrors);
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
            }

            AuthorizationRequest created = authorizationService.createRequest(dto);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        return authorizationService.getRequestById(id)
                .map(req -> {
                    List<StatusHistory> history = authorizationService.getStatusHistory(id);
                    List<MessageDto> messages = authorizationService.getMessages(id);
                    
                    Map<String, Object> response = new HashMap<>();
                    response.put("request", req);
                    response.put("history", history);
                    response.put("messages", messages);
                    return ResponseEntity.ok(response);
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @Valid @RequestBody AuthorizationRequestDto dto) {
        try {
            String mockFhir = generateMockFhir(dto);
            List<String> fhirErrors = fhirValidationService.validateClaim(mockFhir);
            if (!fhirErrors.isEmpty()) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "FHIR Validation Failed");
                errorResponse.put("details", fhirErrors);
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
            }

            AuthorizationRequest updated = authorizationService.updateRequest(id, dto);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<AuthorizationRequest>> listAll() {
        return ResponseEntity.ok(authorizationService.getRequestsForPayer());
    }

    @GetMapping("/{id}/messages")
    public ResponseEntity<List<MessageDto>> getMessages(@PathVariable Long id) {
        return ResponseEntity.ok(authorizationService.getMessages(id));
    }

    @PostMapping("/{id}/messages")
    public ResponseEntity<?> addMessage(
            @PathVariable Long id,
            @RequestParam Long senderId,
            @RequestBody Map<String, String> payload) {
        String content = payload.get("message");
        if (content == null || content.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Message content cannot be empty");
        }
        try {
            Message msg = authorizationService.addMessage(id, senderId, content);
            return ResponseEntity.status(HttpStatus.CREATED).body(msg);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    private String generateMockFhir(AuthorizationRequestDto dto) {
        return "{\n" +
                "  \"resourceType\": \"Claim\",\n" +
                "  \"id\": \"claim-draft\",\n" +
                "  \"status\": \"active\",\n" +
                "  \"use\": \"preauthorization\",\n" +
                "  \"patient\": { \"reference\": \"Patient/pat-" + dto.getPatientId() + "\" },\n" +
                "  \"insurance\": [ { \"sequence\": 1, \"focal\": true, \"coverage\": { \"reference\": \"Coverage/cov-" + dto.getCoverageId() + "\" } } ],\n" +
                "  \"diagnosis\": [ { \"sequence\": 1, \"diagnosisCodeableConcept\": { \"coding\": [ { \"system\": \"sys\", \"code\": \"" + dto.getDiagnosisCode() + "\" } ] } } ],\n" +
                "  \"item\": [ { \"sequence\": 1, \"productOrService\": { \"coding\": [ { \"system\": \"sys\", \"code\": \"" + dto.getTreatmentCode() + "\" } ] } } ]\n" +
                "}";
    }
}
