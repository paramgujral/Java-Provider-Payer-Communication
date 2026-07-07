package com.healthconn.healthcare_connector.payer.controller;

import com.healthconn.healthcare_connector.authentication.entity.User;
import com.healthconn.healthcare_connector.payer.dto.ReviewRequestDto;
import com.healthconn.healthcare_connector.payer.service.PayerService;
import com.healthconn.healthcare_connector.provider.dto.AuthRequestResponseDto;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/payer")
@RequiredArgsConstructor
public class PayerController {

    private final PayerService payerService;

    // Only PAYER can see pending requests
    @GetMapping("/requests")
    @PreAuthorize("hasAnyRole('PAYER', 'ADMIN')")
    public ResponseEntity<List<AuthRequestResponseDto>> getPendingRequests() {
        return ResponseEntity.ok(payerService.getPendingRequests());
    }

    // Only PAYER can approve/reject
    @PutMapping("/requests/{id}/review")
    @PreAuthorize("hasRole('PAYER')")
    public ResponseEntity<AuthRequestResponseDto> reviewRequest(
            @PathVariable Long id,
            @Valid @RequestBody ReviewRequestDto dto,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(payerService.reviewRequest(id, dto, currentUser.getId()));
    }

    // PAYER + ADMIN + MANAGER can see all requests (for dashboard/reporting)
    @GetMapping("/requests/all")
    public ResponseEntity<List<AuthRequestResponseDto>> getAllRequests() {
        return ResponseEntity.ok(payerService.getAllRequests());
    }
}