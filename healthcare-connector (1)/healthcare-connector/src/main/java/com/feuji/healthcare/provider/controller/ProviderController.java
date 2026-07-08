package com.feuji.healthcare.provider.controller;

import com.feuji.healthcare.common.response.ApiResponse;
import com.feuji.healthcare.provider.dto.ProviderRequestDto;
import com.feuji.healthcare.provider.dto.ProviderResponseDto;
import com.feuji.healthcare.provider.service.ProviderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/providers")
@RequiredArgsConstructor
public class ProviderController {

    private final ProviderService providerService;

    @PostMapping
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<ProviderResponseDto>>
    createProvider(
            @RequestBody ProviderRequestDto request) {

        ProviderResponseDto response =
                providerService.createProvider(request);

        return ResponseEntity.ok(
                ApiResponse.<ProviderResponseDto>builder()
                        .success(true)
                        .message("Provider created successfully")
                        .data(response)
                        .build()
        );
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ROLE_ADMIN','PAYER')")
    public ResponseEntity<ApiResponse<List<ProviderResponseDto>>>
    getAllProviders() {

        List<ProviderResponseDto> response =
                providerService.getAllProviders();

        return ResponseEntity.ok(
                ApiResponse.<List<ProviderResponseDto>>builder()
                        .success(true)
                        .message("Providers fetched successfully")
                        .data(response)
                        .build()
        );
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN','PAYER')")
    public ResponseEntity<ApiResponse<ProviderResponseDto>>
    getProviderById(
            @PathVariable Long id) {

        ProviderResponseDto response =
                providerService.getProviderById(id);

        return ResponseEntity.ok(
                ApiResponse.<ProviderResponseDto>builder()
                        .success(true)
                        .message("Provider fetched successfully")
                        .data(response)
                        .build()
        );
    }
}
