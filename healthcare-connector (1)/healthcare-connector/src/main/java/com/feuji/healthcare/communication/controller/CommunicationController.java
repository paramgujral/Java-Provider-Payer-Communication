package com.feuji.healthcare.communication.controller;

import com.feuji.healthcare.common.response.ApiResponse;
import com.feuji.healthcare.communication.dto.CommunicationRequestDto;
import com.feuji.healthcare.communication.dto.CommunicationResponseDto;
import com.feuji.healthcare.communication.service.CommunicationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/communications")
@RequiredArgsConstructor
public class CommunicationController {

    private final CommunicationService communicationService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','PROVIDER','PAYER')")
    public ResponseEntity<ApiResponse<CommunicationResponseDto>>
    addComment(
            @RequestBody CommunicationRequestDto request) {

        return ResponseEntity.ok(
                ApiResponse.<CommunicationResponseDto>builder()
                        .success(true)
                        .message("Comment Added Successfully")
                        .data(
                                communicationService
                                        .addComment(request))
                        .build()
        );
    }

    @GetMapping("/{authorizationId}")
    @PreAuthorize("hasAnyRole('ADMIN','PROVIDER','PAYER')")
    public ResponseEntity<ApiResponse<List<CommunicationResponseDto>>>
    getComments(
            @PathVariable Long authorizationId) {

        return ResponseEntity.ok(
                ApiResponse.<List<CommunicationResponseDto>>builder()
                        .success(true)
                        .message("Comments Fetched Successfully")
                        .data(
                                communicationService
                                        .getComments(
                                                authorizationId))
                        .build()
        );
    }
}