package com.connector.fhir.controller;

import com.connector.fhir.model.AuthorizationRequest;
import com.connector.fhir.service.AuthorizationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payer")
public class PayerController {

    private final AuthorizationService authorizationService;

    public PayerController(AuthorizationService authorizationService) {
        this.authorizationService = authorizationService;
    }

    @GetMapping("/requests")
    public ResponseEntity<List<AuthorizationRequest>> getRequests() {
        List<AuthorizationRequest> list = authorizationService.getRequestsForPayer();
        return ResponseEntity.ok(list);
    }

    @PostMapping("/approve")
    public ResponseEntity<?> approve(@RequestBody Map<String, Object> payload) {
        Long requestId = ((Number) payload.get("requestId")).longValue();
        String note = (String) payload.getOrDefault("note", "Approved by insurance reviewer");
        Long userId = ((Number) payload.getOrDefault("userId", 2)).longValue();

        try {
            AuthorizationRequest req = authorizationService.updateStatus(requestId, "APPROVED", note, userId);
            return ResponseEntity.ok(req);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/reject")
    public ResponseEntity<?> reject(@RequestBody Map<String, Object> payload) {
        Long requestId = ((Number) payload.get("requestId")).longValue();
        String note = (String) payload.getOrDefault("note", "Rejected by insurance reviewer");
        Long userId = ((Number) payload.getOrDefault("userId", 2)).longValue();

        try {
            AuthorizationRequest req = authorizationService.updateStatus(requestId, "REJECTED", note, userId);
            return ResponseEntity.ok(req);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/request-info")
    public ResponseEntity<?> requestInfo(@RequestBody Map<String, Object> payload) {
        Long requestId = ((Number) payload.get("requestId")).longValue();
        String note = (String) payload.get("note");
        Long userId = ((Number) payload.getOrDefault("userId", 2)).longValue();

        if (note == null || note.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Correction description notes are required when requesting more info.");
        }

        try {
            // Update request status to INFO_REQUIRED
            AuthorizationRequest req = authorizationService.updateStatus(requestId, "INFO_REQUIRED", "Information requested: " + note, userId);
            // Append message from payer
            authorizationService.addMessage(requestId, userId, note);
            return ResponseEntity.ok(req);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
