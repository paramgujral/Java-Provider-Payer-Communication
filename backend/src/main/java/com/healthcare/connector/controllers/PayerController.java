package com.healthcare.connector.controllers;

import com.healthcare.connector.Dto.ResponseDto;
import com.healthcare.connector.models.AuthorizationRequest;
import com.healthcare.connector.models.AuthorizationResponse;
import com.healthcare.connector.service.AuthorizationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payer")
@PreAuthorize("hasRole('PAYER')")

public class PayerController {

    private final AuthorizationService authService;

    public PayerController(AuthorizationService authService) {
        this.authService = authService;
    }

    @GetMapping("/requests")
    public ResponseEntity<List<AuthorizationRequest>> getPendingRequests() {
        return ResponseEntity.ok(authService.getPayerPendingRequests());
    }

    @PostMapping("/request/{id}/response")
    public ResponseEntity<AuthorizationResponse> respondToRequest(@PathVariable Long id,
                                                                  @RequestBody ResponseDto dto) {
        return ResponseEntity.ok(authService.respondToRequest(id, dto.getStatus(), dto.getNotes()));
    }
}
