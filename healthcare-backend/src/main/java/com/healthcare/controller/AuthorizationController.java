package com.healthcare.controller;

import com.healthcare.dto.AiReviewResponse;
import com.healthcare.dto.AuthorizationRequestDto;
import com.healthcare.dto.CommunicationNoteDto;
import com.healthcare.entity.AuditLog;
import com.healthcare.entity.AuthorizationRequest;
import com.healthcare.service.AiCopilotService;
import com.healthcare.service.AuthorizationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.util.List;

@RestController
@RequestMapping("/api/v1/authorizations")
@RequiredArgsConstructor
@Tag(name = "Authorization API", description = "Endpoints for managing healthcare authorizations and AI reviews")
public class AuthorizationController {

    private final AuthorizationService authorizationService;
    private final AiCopilotService aiCopilotService;

    @Operation(summary = "Analyze an authorization request using AI Copilot before submission")
    @PostMapping("/analyze")
    public Mono<ResponseEntity<AiReviewResponse>> analyzeRequest(@RequestBody AuthorizationRequest request) {
        return aiCopilotService.analyzeRequest(request)
                .map(ResponseEntity::ok)
                .onErrorResume(e -> {
                    AiReviewResponse fallback = new AiReviewResponse();
                    fallback.setConfidenceScore(0.0);
                    fallback.addSuggestion("AI analysis encountered an error. Please review the request manually.");
                    return Mono.just(ResponseEntity.ok(fallback));
                });
    }

    @Operation(summary = "Run AI Adjudication on an existing request (Payer action)")
    @PostMapping("/{id}/adjudicate")
    public Mono<ResponseEntity<AiReviewResponse>> adjudicateRequest(@PathVariable String id) {
        return authorizationService.adjudicateRequest(id)
                .map(ResponseEntity::ok)
                .onErrorResume(e -> {
                    AiReviewResponse fallback = new AiReviewResponse();
                    fallback.setConfidenceScore(0.0);
                    fallback.addSuggestion("AI adjudication encountered an error. Please review the request manually.");
                    return Mono.just(ResponseEntity.ok(fallback));
                });
    }

    @Operation(summary = "Submit a new authorization request (with validation)")
    @PostMapping
    public ResponseEntity<AuthorizationRequest> createRequest(@Valid @RequestBody AuthorizationRequestDto dto) {
        AuthorizationRequest created = authorizationService.createRequest(dto);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @Operation(summary = "Get an authorization request by ID")
    @GetMapping("/{id}")
    public ResponseEntity<AuthorizationRequest> getRequestById(@PathVariable String id) {
        return ResponseEntity.ok(authorizationService.getRequestById(id));
    }

    @Operation(summary = "Get paginated authorization requests by Provider ID")
    @GetMapping("/provider/{providerId}")
    public ResponseEntity<Page<AuthorizationRequest>> getRequestsByProvider(
            @PathVariable String providerId, Pageable pageable) {
        return ResponseEntity.ok(authorizationService.getRequestsByProvider(providerId, pageable));
    }

    @Operation(summary = "Get paginated authorization requests by Payer ID")
    @GetMapping("/payer/{payerId}")
    public ResponseEntity<Page<AuthorizationRequest>> getRequestsByPayer(
            @PathVariable String payerId, Pageable pageable) {
        return ResponseEntity.ok(authorizationService.getRequestsByPayer(payerId, pageable));
    }

    @Operation(summary = "Update the status of an authorization request (Payer action)")
    @PatchMapping("/{id}/status")
    public ResponseEntity<AuthorizationRequest> updateStatus(
            @PathVariable String id, @RequestParam AuthorizationRequest.RequestStatus status) {
        return ResponseEntity.ok(authorizationService.updateStatus(id, status));
    }

    @Operation(summary = "Add a communication note (bidirectional: Provider or Payer can respond)")
    @PostMapping("/{id}/notes")
    public ResponseEntity<AuthorizationRequest> addCommunicationNote(
            @PathVariable String id, @Valid @RequestBody CommunicationNoteDto noteDto) {
        return ResponseEntity.ok(authorizationService.addCommunicationNote(id, noteDto));
    }

    @Operation(summary = "Get the full audit trail for an authorization request")
    @GetMapping("/{id}/audit")
    public ResponseEntity<List<AuditLog>> getAuditTrail(@PathVariable String id) {
        return ResponseEntity.ok(authorizationService.getAuditTrail(id));
    }
}
