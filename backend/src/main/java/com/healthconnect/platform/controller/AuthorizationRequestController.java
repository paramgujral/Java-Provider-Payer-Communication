package com.healthconnect.platform.controller;

import com.healthconnect.platform.dto.request.CreateAuthorizationRequest;
import com.healthconnect.platform.dto.request.ResubmitRequest;
import com.healthconnect.platform.dto.request.ReviewDecisionRequest;
import com.healthconnect.platform.dto.response.*;
import com.healthconnect.platform.entity.User;
import com.healthconnect.platform.enums.RequestStatus;
import com.healthconnect.platform.service.AuditLogService;
import com.healthconnect.platform.service.AuthorizationRequestService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/requests")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Authorization Requests", description = "Create, submit, review and track authorization requests")
public class AuthorizationRequestController {

    private final AuthorizationRequestService requestService;
    private final AuditLogService auditLogService;

    // ─── Provider Endpoints ────────────────────────────────────────────────────

    @PostMapping
    @PreAuthorize("hasRole('PROVIDER')")
    @Operation(summary = "Create a new authorization request (saved as DRAFT)")
    public ResponseEntity<ApiResponse<AuthorizationRequestResponse>> createRequest(
            @Valid @RequestBody CreateAuthorizationRequest dto,
            @AuthenticationPrincipal User provider) {
        AuthorizationRequestResponse response = requestService.createDraft(dto, provider);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Request created successfully", response));
    }

    @GetMapping
    @PreAuthorize("hasRole('PROVIDER')")
    @Operation(summary = "Get all requests for the current provider with optional filters")
    public ResponseEntity<ApiResponse<List<AuthorizationRequestResponse>>> getMyRequests(
            @RequestParam(required = false) RequestStatus status,
            @RequestParam(required = false) String search,
            @AuthenticationPrincipal User provider) {
        return ResponseEntity.ok(ApiResponse.success(
                requestService.getProviderRequests(provider, status, search)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get authorization request by ID")
    public ResponseEntity<ApiResponse<AuthorizationRequestResponse>> getRequest(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.success(requestService.getRequestById(id, user)));
    }

    @PostMapping("/{id}/submit")
    @PreAuthorize("hasRole('PROVIDER')")
    @Operation(summary = "Submit a DRAFT request for payer review")
    public ResponseEntity<ApiResponse<AuthorizationRequestResponse>> submitRequest(
            @PathVariable Long id,
            @AuthenticationPrincipal User provider) {
        return ResponseEntity.ok(ApiResponse.success("Request submitted successfully",
                requestService.submitRequest(id, provider)));
    }

    @PostMapping("/{id}/resubmit")
    @PreAuthorize("hasRole('PROVIDER')")
    @Operation(summary = "Resubmit a request that had additional information requested")
    public ResponseEntity<ApiResponse<AuthorizationRequestResponse>> resubmitRequest(
            @PathVariable Long id,
            @RequestBody ResubmitRequest dto,
            @AuthenticationPrincipal User provider) {
        return ResponseEntity.ok(ApiResponse.success("Request resubmitted successfully",
                requestService.resubmitRequest(id, dto, provider)));
    }

    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('PROVIDER')")
    @Operation(summary = "Get provider dashboard statistics")
    public ResponseEntity<ApiResponse<ProviderDashboardResponse>> getProviderDashboard(
            @AuthenticationPrincipal User provider) {
        return ResponseEntity.ok(ApiResponse.success(requestService.getProviderDashboard(provider)));
    }

    // ─── Payer Endpoints ───────────────────────────────────────────────────────

    @GetMapping("/queue")
    @PreAuthorize("hasRole('PAYER')")
    @Operation(summary = "Get payer review queue with optional filters")
    public ResponseEntity<ApiResponse<List<AuthorizationRequestResponse>>> getQueue(
            @RequestParam(required = false) RequestStatus status,
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(ApiResponse.success(requestService.getPayerQueue(status, search)));
    }

    @PostMapping("/{id}/review/start")
    @PreAuthorize("hasRole('PAYER')")
    @Operation(summary = "Mark request as IN_REVIEW — assign to current reviewer")
    public ResponseEntity<ApiResponse<AuthorizationRequestResponse>> startReview(
            @PathVariable Long id,
            @AuthenticationPrincipal User reviewer) {
        return ResponseEntity.ok(ApiResponse.success("Review started",
                requestService.startReview(id, reviewer)));
    }

    @PostMapping("/{id}/review/decision")
    @PreAuthorize("hasRole('PAYER')")
    @Operation(summary = "Approve, Deny, or Request More Information on a request")
    public ResponseEntity<ApiResponse<AuthorizationRequestResponse>> processDecision(
            @PathVariable Long id,
            @Valid @RequestBody ReviewDecisionRequest dto,
            @AuthenticationPrincipal User reviewer) {
        return ResponseEntity.ok(ApiResponse.success("Decision recorded",
                requestService.processDecision(id, dto, reviewer)));
    }

    @GetMapping("/payer/dashboard")
    @PreAuthorize("hasRole('PAYER')")
    @Operation(summary = "Get payer dashboard statistics")
    public ResponseEntity<ApiResponse<PayerDashboardResponse>> getPayerDashboard() {
        return ResponseEntity.ok(ApiResponse.success(requestService.getPayerDashboard()));
    }

    // ─── Shared Endpoints ─────────────────────────────────────────────────────

    @GetMapping("/status/{status}")
    @Operation(summary = "Get requests by status (for Kanban board)")
    public ResponseEntity<ApiResponse<List<AuthorizationRequestResponse>>> getByStatus(
            @PathVariable RequestStatus status,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.success(
                requestService.getRequestsByStatus(status, user)));
    }

    @GetMapping("/{id}/ai-analysis")
    @Operation(summary = "Run AI copilot analysis on a request")
    public ResponseEntity<ApiResponse<AiAnalysisResponse>> analyzeRequest(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.success(requestService.analyzeRequest(id, user)));
    }

    @GetMapping("/{id}/audit")
    @Operation(summary = "Get full audit timeline for a request")
    public ResponseEntity<ApiResponse<List<AuditLogResponse>>> getAuditTimeline(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        // Verify access via getRequestById (throws if unauthorized)
        requestService.getRequestById(id, user);
        return ResponseEntity.ok(ApiResponse.success(auditLogService.getLogsForRequest(id)));
    }
}
