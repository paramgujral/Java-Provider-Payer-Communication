package com.healthcare.authorization.controller;

import com.healthcare.authorization.entity.AuthorizationRequest;
import com.healthcare.authorization.service.AuthorizationRequestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/authorization")
@RequiredArgsConstructor
public class AuthorizationRequestController {
    private final AuthorizationRequestService service;

    @PostMapping
    @PreAuthorize("hasAnyRole('PROVIDER','ADMIN')")
    public AuthorizationRequest create(@Valid @RequestBody AuthorizationRequest request) {
        return service.create(request);
    }

    @PutMapping("/{id}/submit")
    @PreAuthorize("hasAnyRole('PROVIDER','ADMIN')")
    public AuthorizationRequest submit(@PathVariable Long id) {
        return service.submit(id);
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('PAYER','ADMIN')")
    public AuthorizationRequest approve(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return service.approve(id, body.getOrDefault("remarks", "Approved"));
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('PAYER','ADMIN')")
    public AuthorizationRequest reject(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return service.reject(id, body.getOrDefault("remarks", "Rejected"));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('PROVIDER','PAYER','ADMIN')")
    public AuthorizationRequest getById(@PathVariable Long id) {
        return service.getById(id);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('PROVIDER','PAYER','ADMIN')")
    public List<AuthorizationRequest> getAll() {
        return service.getAll();
    }
}
