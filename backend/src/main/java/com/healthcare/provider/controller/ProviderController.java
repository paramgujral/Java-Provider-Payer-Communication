package com.healthcare.provider.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.healthcare.common.response.ApiResponse;
import com.healthcare.provider.dto.CreateProviderRequest;
import com.healthcare.provider.dto.ProviderResponse;
import com.healthcare.provider.service.ProviderService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/provider")
@RequiredArgsConstructor
public class ProviderController {

    private final ProviderService providerService;

    @PostMapping
    public ResponseEntity<ApiResponse<ProviderResponse>> createProvider(@Valid @RequestBody CreateProviderRequest request) {
        ProviderResponse response = providerService.createProvider(request, 1L);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.<ProviderResponse>builder()
                .success(true)
                .message("Provider created successfully")
                .data(response)
                .build());
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ProviderResponse>>> getAllProviders() {
        return ResponseEntity.ok(ApiResponse.<List<ProviderResponse>>builder()
                .success(true)
                .message("Providers retrieved successfully")
                .data(providerService.getAllProviders())
                .build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProviderResponse>> getProviderById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.<ProviderResponse>builder()
                .success(true)
                .message("Provider retrieved successfully")
                .data(providerService.getProviderById(id))
                .build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ProviderResponse>> updateProvider(@PathVariable Long id, @Valid @RequestBody CreateProviderRequest request) {
        return ResponseEntity.ok(ApiResponse.<ProviderResponse>builder()
                .success(true)
                .message("Provider updated successfully")
                .data(providerService.updateProvider(id, request))
                .build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteProvider(@PathVariable Long id) {
        providerService.deleteProvider(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true)
                .message("Provider deleted successfully")
                .data(null)
                .build());
    }
}
