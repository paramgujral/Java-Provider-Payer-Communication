package com.healthconn.healthcare_connector.payer.controller;

import com.healthconn.healthcare_connector.authentication.entity.User;
import com.healthconn.healthcare_connector.payer.dto.ReviewRequestDto;
import com.healthconn.healthcare_connector.payer.service.PayerService;
import com.healthconn.healthcare_connector.provider.dto.AuthRequestResponseDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
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
@Tag(name = "Payer APIs")
public class PayerController {

    private final PayerService payerService;

    // ==========================================================
    // Get Pending Requests
    // ==========================================================

    @Operation(summary = "Get all pending authorization requests")
    @GetMapping("/requests")
    @PreAuthorize("hasAnyRole('PAYER','ADMIN')")
    public ResponseEntity<List<AuthRequestResponseDto>> getPendingRequests() {

        return ResponseEntity.ok(
                payerService.getPendingRequests()
        );

    }

    // ==========================================================
    // Review Request
    // ==========================================================

    @Operation(summary = "Approve or reject an authorization request")
    @PutMapping("/requests/{id}/review")
    @PreAuthorize("hasRole('PAYER')")
    public ResponseEntity<AuthRequestResponseDto> reviewRequest(

            @PathVariable Long id,

            @Valid
            @RequestBody ReviewRequestDto dto,

            @AuthenticationPrincipal User currentUser

    ) {

        return ResponseEntity.ok(

                payerService.reviewRequest(
                        id,
                        dto,
                        currentUser.getId()
                )

        );

    }

    // ==========================================================
    // Get All Requests
    // ==========================================================

    @Operation(summary = "Get all authorization requests")
    @GetMapping("/requests/all")
    @PreAuthorize("hasAnyRole('PAYER','ADMIN','MANAGER')")
    public ResponseEntity<List<AuthRequestResponseDto>> getAllRequests() {

        return ResponseEntity.ok(
                payerService.getAllRequests()
        );

    }

}