package com.healthcare.authorization.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.healthcare.ai.dto.AiReviewResponse;
import com.healthcare.authorization.dto.AuthorizationDecisionRequest;
import com.healthcare.authorization.dto.AuthorizationResponse;
import com.healthcare.authorization.dto.AuthorizationUploadRequest;
import com.healthcare.authorization.service.AuthorizationService;
import com.healthcare.common.response.ApiResponse;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/authorization")
@RequiredArgsConstructor
public class AuthorizationController {

    private final AuthorizationService authorizationService;

    @PostMapping("/upload")
    public ResponseEntity<ApiResponse<AuthorizationResponse>> upload(@Valid @RequestBody AuthorizationUploadRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.<AuthorizationResponse>builder()
                .success(true)
                .message("Authorization request uploaded")
                .data(authorizationService.saveDraft(request))
                .build());
    }

    @PostMapping("/draft")
    public ResponseEntity<ApiResponse<AuthorizationResponse>> saveDraft(@Valid @RequestBody AuthorizationUploadRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.<AuthorizationResponse>builder()
                .success(true)
                .message("Authorization draft saved")
                .data(authorizationService.saveDraft(request))
                .build());
    }

    @PostMapping("/{id}/submit")
    public ResponseEntity<ApiResponse<AuthorizationResponse>> submit(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.<AuthorizationResponse>builder()
                .success(true)
                .message("Authorization request submitted")
                .data(authorizationService.submit(id))
                .build());
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<AuthorizationResponse>>> getAll() {
        return ResponseEntity.ok(ApiResponse.<List<AuthorizationResponse>>builder()
                .success(true)
                .message("Authorization requests retrieved")
                .data(authorizationService.getAll())
                .build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AuthorizationResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.<AuthorizationResponse>builder()
                .success(true)
                .message("Authorization request retrieved")
                .data(authorizationService.getById(id))
                .build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<AuthorizationResponse>> updateStatus(@PathVariable Long id, @RequestParam String status) {
        return ResponseEntity.ok(ApiResponse.<AuthorizationResponse>builder()
                .success(true)
                .message("Authorization request updated")
                .data(authorizationService.updateStatus(id, status))
                .build());
    }

    @PutMapping("/{id}/decision")
    public ResponseEntity<ApiResponse<AuthorizationResponse>> decide(@PathVariable Long id, @Valid @RequestBody AuthorizationDecisionRequest request) {
        return ResponseEntity.ok(ApiResponse.<AuthorizationResponse>builder()
                .success(true)
                .message("Authorization request decision recorded")
                .data(authorizationService.applyDecision(id, request))
                .build());
    }

    @PutMapping("/{id}/ai-review")
    public ResponseEntity<ApiResponse<AuthorizationResponse>> saveAiReview(@PathVariable Long id, @RequestBody AiReviewResponse request) {
        return ResponseEntity.ok(ApiResponse.<AuthorizationResponse>builder()
                .success(true)
                .message("AI review saved")
                .data(authorizationService.applyAiReview(id, request))
                .build());
    }
}
