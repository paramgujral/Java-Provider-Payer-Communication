package com.healthcare.payer.controller;

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
import com.healthcare.payer.dto.CreatePayerRequest;
import com.healthcare.payer.dto.PayerResponse;
import com.healthcare.payer.service.PayerService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/payer")
@RequiredArgsConstructor
public class PayerController {

    private final PayerService payerService;

    @PostMapping
    public ResponseEntity<ApiResponse<PayerResponse>> createPayer(@Valid @RequestBody CreatePayerRequest request) {
        PayerResponse response = payerService.createPayer(request, 1L);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.<PayerResponse>builder()
                .success(true)
                .message("Payer created successfully")
                .data(response)
                .build());
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<PayerResponse>>> getAllPayers() {
        return ResponseEntity.ok(ApiResponse.<List<PayerResponse>>builder()
                .success(true)
                .message("Payers retrieved successfully")
                .data(payerService.getAllPayers())
                .build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PayerResponse>> getPayerById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.<PayerResponse>builder()
                .success(true)
                .message("Payer retrieved successfully")
                .data(payerService.getPayerById(id))
                .build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<PayerResponse>> updatePayer(@PathVariable Long id, @Valid @RequestBody CreatePayerRequest request) {
        return ResponseEntity.ok(ApiResponse.<PayerResponse>builder()
                .success(true)
                .message("Payer updated successfully")
                .data(payerService.updatePayer(id, request))
                .build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePayer(@PathVariable Long id) {
        payerService.deletePayer(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true)
                .message("Payer deleted successfully")
                .data(null)
                .build());
    }
}
