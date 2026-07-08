package com.feuji.healthcare.payer.controller;

import com.feuji.healthcare.common.response.ApiResponse;
import com.feuji.healthcare.payer.dto.PayerRequestDto;
import com.feuji.healthcare.payer.dto.PayerResponseDto;
import com.feuji.healthcare.payer.service.PayerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/payers")
@RequiredArgsConstructor
public class PayerController {

    private final PayerService payerService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PayerResponseDto>> createPayer(
            @RequestBody PayerRequestDto request) {

        PayerResponseDto response =
                payerService.createPayer(request);

        return ResponseEntity.ok(
                ApiResponse.<PayerResponseDto>builder()
                        .success(true)
                        .message("Payer created successfully")
                        .data(response)
                        .build()
        );
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','PROVIDER')")
    public ResponseEntity<ApiResponse<List<PayerResponseDto>>> getAllPayers() {

        return ResponseEntity.ok(
                ApiResponse.<List<PayerResponseDto>>builder()
                        .success(true)
                        .message("Payers fetched successfully")
                        .data(payerService.getAllPayers())
                        .build()
        );
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','PROVIDER')")
    public ResponseEntity<ApiResponse<PayerResponseDto>> getPayerById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                ApiResponse.<PayerResponseDto>builder()
                        .success(true)
                        .message("Payer fetched successfully")
                        .data(payerService.getPayerById(id))
                        .build()
        );
    }
}
