package com.healthcare.connector.authorization.controller;

import com.healthcare.connector.auth.dto.AuthDTO;
import com.healthcare.connector.auth.entity.User;
import com.healthcare.connector.auth.service.UserService;
import com.healthcare.connector.authorization.dto.AuthorizationDTO;
import com.healthcare.connector.authorization.enums.AuthorizationStatus;
import com.healthcare.connector.authorization.service.AuthorizationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/authorizations")
@RequiredArgsConstructor
@Tag(name = "Authorization Requests")
@SecurityRequirement(name = "bearerAuth")
public class AuthorizationController {

    private final AuthorizationService authService;
    private final UserService userService;

    @PostMapping
    @Operation(summary = "Create a new prior authorization request (Provider)")
    public ResponseEntity<AuthorizationDTO.Response> create(
            @RequestBody AuthorizationDTO.CreateRequest req,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(authService.createRequest(req, user));
    }

    @GetMapping
    @Operation(summary = "List authorization requests for current user")
    public ResponseEntity<Page<AuthorizationDTO.Response>> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String q,
            @RequestParam(required = false) AuthorizationStatus status,
            @AuthenticationPrincipal User user) {
        PageRequest pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(authService.getRequestsForUser(user, q, status, pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get authorization request by ID")
    public ResponseEntity<AuthorizationDTO.Response> getById(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(authService.getById(id, user));
    }

    @PostMapping("/{id}/ai-review")
    @Operation(summary = "Run AI Copilot review on request")
    public ResponseEntity<AuthorizationDTO.AiReviewResponse> aiReview(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(authService.requestAiReview(id, user));
    }

    @PostMapping("/{id}/submit")
    @Operation(summary = "Submit request to payer (Provider)")
    public ResponseEntity<AuthorizationDTO.Response> submit(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(authService.submitToPayer(id, user));
    }

    @PostMapping("/{id}/decision")
    @Operation(summary = "Record payer decision (Payer)")
    public ResponseEntity<AuthorizationDTO.Response> decision(
            @PathVariable Long id,
            @RequestBody AuthorizationDTO.PayerDecisionRequest req,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(authService.recordPayerDecision(id, req, user));
    }

    @GetMapping("/{id}/history")
    @Operation(summary = "Get status history for a request")
    public ResponseEntity<List<AuthorizationDTO.StatusHistoryResponse>> history(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(authService.getStatusHistory(id, user));
    }

    @GetMapping("/dashboard/stats")
    @Operation(summary = "Get dashboard statistics")
    public ResponseEntity<AuthorizationDTO.DashboardStats> stats(
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(authService.getDashboardStats(user));
    }

    @GetMapping("/payers")
    @Operation(summary = "List all payer organizations")
    public ResponseEntity<List<AuthDTO.UserResponse>> getPayers() {
        return ResponseEntity.ok(userService.getPayers());
    }

    @GetMapping("/providers")
    @Operation(summary = "List all provider organizations")
    public ResponseEntity<List<AuthDTO.UserResponse>> getProviders() {
        return ResponseEntity.ok(userService.getProviders());
    }
}
