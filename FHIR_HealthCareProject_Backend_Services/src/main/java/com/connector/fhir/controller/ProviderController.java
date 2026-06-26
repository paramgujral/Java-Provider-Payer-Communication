package com.connector.fhir.controller;

import com.connector.fhir.model.AuthorizationRequest;
import com.connector.fhir.service.AuthorizationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/provider")
public class ProviderController {

    private final AuthorizationService authorizationService;

    public ProviderController(AuthorizationService authorizationService) {
        this.authorizationService = authorizationService;
    }

    @GetMapping("/requests")
    public ResponseEntity<List<AuthorizationRequest>> getRequests(@RequestParam(name = "providerId", defaultValue = "1") Long providerId) {
        List<AuthorizationRequest> list = authorizationService.getRequestsForProvider(providerId);
        return ResponseEntity.ok(list);
    }
}
