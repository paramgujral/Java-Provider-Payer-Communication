package com.feuji.healthcare.authorization.controller;

import com.feuji.healthcare.authorization.dto.ApprovalRequestDto;
import com.feuji.healthcare.authorization.dto.AuthorizationRequestDto;
import com.feuji.healthcare.authorization.dto.AuthorizationResponseDto;
import com.feuji.healthcare.authorization.service.AuthorizationService;
import com.feuji.healthcare.common.response.ApiResponse;
import com.feuji.healthcare.communication.dto.ClarificationRequestDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/authorizations")
@RequiredArgsConstructor
public class AuthorizationController {

    private final AuthorizationService authorizationService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','PROVIDER')")
    public ResponseEntity<ApiResponse<AuthorizationResponseDto>>
    createRequest(
            @RequestBody AuthorizationRequestDto request) {

        return ResponseEntity.ok(
                ApiResponse.<AuthorizationResponseDto>builder()
                        .success(true)
                        .message("Authorization Request Submitted Successfully")
                        .data(authorizationService.createRequest(request))
                        .build()
        );
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','PROVIDER','PAYER')")
    public ResponseEntity<ApiResponse<List<AuthorizationResponseDto>>>
    getAllRequests() {

        return ResponseEntity.ok(
                ApiResponse.<List<AuthorizationResponseDto>>builder()
                        .success(true)
                        .message("Authorization Requests Fetched Successfully")
                        .data(authorizationService.getAllRequests())
                        .build()
        );
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','PROVIDER','PAYER')")
    public ResponseEntity<ApiResponse<AuthorizationResponseDto>>
    getRequestById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                ApiResponse.<AuthorizationResponseDto>builder()
                        .success(true)
                        .message("Authorization Request Fetched Successfully")
                        .data(authorizationService.getRequestById(id))
                        .build()
        );
    }

    @PutMapping("/{id}/review")
    @PreAuthorize("hasAnyRole('ADMIN','PAYER')")
    public ResponseEntity<ApiResponse<AuthorizationResponseDto>>
    reviewRequest(@PathVariable Long id) {

        return ResponseEntity.ok(
                ApiResponse.<AuthorizationResponseDto>builder()
                        .success(true)
                        .message("Request moved to UNDER_REVIEW")
                        .data(
                                authorizationService
                                        .markUnderReview(id))
                        .build()
        );
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('ADMIN','PAYER')")
    public ResponseEntity<ApiResponse<AuthorizationResponseDto>>
    approveRequest(@PathVariable Long id) {

        return ResponseEntity.ok(
                ApiResponse.<AuthorizationResponseDto>builder()
                        .success(true)
                        .message("Request approved")
                        .data(
                                authorizationService
                                        .approveRequest(id))
                        .build()
        );
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('ADMIN','PAYER')")
    public ResponseEntity<ApiResponse<AuthorizationResponseDto>>
    rejectRequest(
            @PathVariable Long id,
            @RequestBody ApprovalRequestDto request) {

        return ResponseEntity.ok(
                ApiResponse.<AuthorizationResponseDto>builder()
                        .success(true)
                        .message("Request rejected")
                        .data(
                                authorizationService
                                        .rejectRequest(
                                                id,
                                                request))
                        .build()
        );
    }


    @PutMapping("/{id}/clarification-request")
    @PreAuthorize("hasRole('PAYER')")
    public ResponseEntity<ApiResponse<AuthorizationResponseDto>>
    requestClarification(
            @PathVariable Long id,
            @RequestBody ClarificationRequestDto request) {

        return ResponseEntity.ok(
                ApiResponse.<AuthorizationResponseDto>builder()
                        .success(true)
                        .message("Clarification Requested")
                        .data(
                                authorizationService
                                        .requestClarification(
                                                id,
                                                request.getMessage()))
                        .build());
    }

    @PutMapping("/{id}/clarification-response")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<ApiResponse<AuthorizationResponseDto>>
    provideClarification(
            @PathVariable Long id,
            @RequestBody ClarificationRequestDto request) {

        return ResponseEntity.ok(
                ApiResponse.<AuthorizationResponseDto>builder()
                        .success(true)
                        .message("Clarification Provided")
                        .data(
                                authorizationService
                                        .provideClarification(
                                                id,
                                                request.getMessage()))
                        .build());
    }
}
