package com.example.demo.controller;

import com.example.demo.dto.AuthorizationRequestDTO;
import com.example.demo.model.AuthorizationRequest;
import com.example.demo.model.Provider;
import com.example.demo.services.AuthorizationService;
import com.example.demo.services.ProviderService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/provider")
public class ProviderController {

    private final AuthorizationService authorizationService;

    private final ProviderService providerService;

    public ProviderController(AuthorizationService authorizationService, ProviderService providerService) {
        this.authorizationService = authorizationService;
        this.providerService = providerService;
    }

    @PostMapping("/submit")
    public ResponseEntity<AuthorizationRequest> submitRequest(
            @RequestBody AuthorizationRequestDTO dto) {

        return ResponseEntity.ok().body(authorizationService.submitRequest(dto));
    }

    @GetMapping("/requests/{providerId}")
    public List<AuthorizationRequest> getProviderRequests(
            @PathVariable Long providerId) {

        return authorizationService.getProviderRequests(providerId);
    }
    @GetMapping
    public List<Provider> getAllProviders() {

        return providerService.getAllProviders();
    }
}