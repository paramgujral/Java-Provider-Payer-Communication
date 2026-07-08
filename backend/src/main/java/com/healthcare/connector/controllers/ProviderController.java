package com.healthcare.connector.controllers;

import com.healthcare.connector.Dto.CreateRequestDto;
import com.healthcare.connector.models.AiReview;
import com.healthcare.connector.models.AuthorizationRequest;
import com.healthcare.connector.service.AuthorizationService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/provider")
@PreAuthorize("hasRole('PROVIDER')")
public class ProviderController {

    private final AuthorizationService authService;

    public ProviderController(AuthorizationService authService) {
        this.authService = authService;
    }

    @PostMapping("/request")
    public ResponseEntity<AuthorizationRequest> createRequest(@Valid @RequestBody CreateRequestDto dto) {
        return ResponseEntity.ok(authService.createRequest(dto.getPatientId(), dto.getServiceType(), dto.getPayerId()));
    }

    @PutMapping("/request/{id}/submit")
    public ResponseEntity<AuthorizationRequest> submitRequest(@PathVariable Long id) {
        return ResponseEntity.ok(authService.submitRequest(id));
    }

    @GetMapping("/requests")
    public ResponseEntity<List<AuthorizationRequest>> getMyRequests() {
        return ResponseEntity.ok(authService.getProviderRequests());
    }

    @GetMapping("/request/{id}/ai-review")
    public ResponseEntity<AiReview> getAiReview(@PathVariable Long id) {
        return ResponseEntity.ok(authService.getAiReviewForRequest(id));
    }
}
