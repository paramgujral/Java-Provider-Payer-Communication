package com.healthconnect.controller;

import com.healthconnect.config.CurrentUserProvider;
import com.healthconnect.dto.AuthorizationDtos.*;
import com.healthconnect.model.AuthorizationStatus;
import com.healthconnect.model.User;
import com.healthconnect.model.UserRole;
import com.healthconnect.service.AuthorizationRequestService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST API for Prior Authorization requests.
 *
 * Endpoints map conceptually to the Da Vinci PAS workflow:
 *  - POST   /api/auth-requests              -> Provider creates a Claim (DRAFT) + runs AI Copilot review
 *  - POST   /api/auth-requests/{fhirId}/copilot-review -> Re-run AI Copilot review
 *  - POST   /api/auth-requests/{fhirId}/submit         -> Provider submits to payer (SUBMITTED)
 *  - PUT    /api/auth-requests/{fhirId}/status         -> Payer updates status (ClaimResponse-like)
 *  - POST   /api/auth-requests/{fhirId}/cancel         -> Provider cancels
 *  - GET    /api/auth-requests                          -> List requests visible to current user
 *  - GET    /api/auth-requests/{fhirId}                 -> Get single request with history
 */
@RestController
@RequestMapping("/api/auth-requests")
public class AuthorizationController {

    @Autowired
    private AuthorizationRequestService service;

    @Autowired
    private CurrentUserProvider currentUserProvider;

    @PostMapping
    public ResponseEntity<?> createRequest(@Valid @RequestBody CreateRequest dto) {
        User user = currentUserProvider.getCurrentUser();
        if (user.getRole() != UserRole.PROVIDER) {
            return ResponseEntity.status(403).body(Map.of("error", "Only providers can create authorization requests"));
        }
        try {
            AuthorizationResponse resp = service.createRequest(dto, user);
            return ResponseEntity.ok(resp);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{fhirId}/copilot-review")
    public ResponseEntity<?> runCopilotReview(@PathVariable String fhirId) {
        try {
            CopilotReviewResponse review = service.runCopilotReview(fhirId);
            return ResponseEntity.ok(review);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{fhirId}/submit")
    public ResponseEntity<?> submit(@PathVariable String fhirId) {
        User user = currentUserProvider.getCurrentUser();
        try {
            AuthorizationResponse resp = service.submitRequest(fhirId, user);
            return ResponseEntity.ok(resp);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{fhirId}/status")
    public ResponseEntity<?> updateStatus(@PathVariable String fhirId, @Valid @RequestBody StatusUpdateRequest dto) {
        User user = currentUserProvider.getCurrentUser();
        if (user.getRole() != UserRole.PAYER) {
            return ResponseEntity.status(403).body(Map.of("error", "Only payers can update authorization status"));
        }
        try {
            AuthorizationResponse resp = service.updateStatus(fhirId, dto, user);
            return ResponseEntity.ok(resp);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{fhirId}/cancel")
    public ResponseEntity<?> cancel(@PathVariable String fhirId) {
        User user = currentUserProvider.getCurrentUser();
        try {
            AuthorizationResponse resp = service.cancelRequest(fhirId, user);
            return ResponseEntity.ok(resp);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<List<AuthorizationResponse>> list(
            @RequestParam(required = false) AuthorizationStatus status) {
        User user = currentUserProvider.getCurrentUser();
        List<AuthorizationResponse> results = status == null
                ? service.getRequestsForUser(user)
                : service.getRequestsForUserByStatus(user, status);
        return ResponseEntity.ok(results);
    }

    @GetMapping("/{fhirId}")
    public ResponseEntity<?> getOne(@PathVariable String fhirId) {
        try {
            return ResponseEntity.ok(service.getByFhirId(fhirId));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        }
    }
}
