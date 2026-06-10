package com.feuji.healthcare_connector.controller;

import com.feuji.healthcare_connector.entity.AuthorizationRequest;
import com.feuji.healthcare_connector.enums.RequestStatus;
import com.feuji.healthcare_connector.service.AuthorizationRequestService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/authorizations")
public class AuthorizationRequestController {

    private final AuthorizationRequestService service;

    public AuthorizationRequestController(AuthorizationRequestService service) {
        this.service = service;
    }

    @PostMapping
    public AuthorizationRequest create(@RequestBody AuthorizationRequest request) {
        return service.create(request);
    }

    @GetMapping
    public List<AuthorizationRequest> getAll() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public AuthorizationRequest getById(@PathVariable Long id) {
        return service.getById(id);
    }

    @PatchMapping("/{id}/status")
    public AuthorizationRequest updateStatus(
            @PathVariable Long id,
            @RequestParam RequestStatus status
    ) {
        return service.updateStatus(id, status);
    }

    @PutMapping("/{id}")
    public AuthorizationRequest updateRequest(
            @PathVariable Long id,
            @RequestBody AuthorizationRequest request
    ) {
        return service.updateRequest(id, request);
    }
}