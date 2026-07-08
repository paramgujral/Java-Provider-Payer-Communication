package com.example.healthcareconnector.controller;

import com.example.healthcareconnector.entity.AuthorizationRequest;
import com.example.healthcareconnector.service.AuthorizationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/provider")
@RequiredArgsConstructor
public class ProviderController {
    private final AuthorizationService authorizationService;

    @PostMapping("/authorization")
    public ResponseEntity<AuthorizationRequest>
    createAuthorization(@RequestBody AuthorizationRequest request) {
        AuthorizationRequest response = authorizationService.createAuthorization(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/status/{id}")
    public ResponseEntity<AuthorizationRequest> getStatus(@PathVariable Long id) {
        return ResponseEntity.ok(authorizationService.getRequestStatus(id));
    }
}
