package com.healthindustry.healthindustry.controller;


import com.healthindustry.healthindustry.dto.ValidationResponseDTO;
import com.healthindustry.healthindustry.dto.DashboardDTO;
import com.healthindustry.healthindustry.entity.AuthorizationRequest;
import com.healthindustry.healthindustry.entity.AuthorizationStatus;
import com.healthindustry.healthindustry.service.AuthorizationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/requests")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AuthorizationController {

    private final AuthorizationService service;


    @GetMapping(
            "/dashboard/provider/{providerId}")
    public DashboardDTO providerDashboard(
            @PathVariable Long providerId) {

        return service.getProviderDashboard(
                providerId);
    }
//    @GetMapping(
//            "/dashboard/provider/{providerId}"
//    )
//    public DashboardDTO dashboard(
//            @PathVariable Long providerId){
//
//        return service.getProviderDashboard(
//                providerId);
//    }
    @GetMapping(
            "/dashboard/payer")
    public DashboardDTO payerDashboard() {

        return service.getPayerDashboard();
    }
    @PostMapping("/validate")
    public ValidationResponseDTO validate(
            @RequestBody AuthorizationRequest request) {

        return service.reviewWithCopilot(request);
    }

    @PostMapping("/submit")
    public AuthorizationRequest submit(
            @RequestBody AuthorizationRequest request) {

        return service.submit(request);
    }

    @GetMapping("/payer")
    public List<AuthorizationRequest> getPending() {

        return service.getPendingRequests();
    }

    @PutMapping("/{id}/status")
    public AuthorizationRequest updateStatus(
            @PathVariable Long id,
            @RequestParam AuthorizationStatus status) {

        return service.updateStatus(id, status);
    }

    @GetMapping("/provider/{providerId}/notifications")
    public List<AuthorizationRequest> notifications(
            @PathVariable Long providerId) {

        return service.getProviderNotifications(
                providerId);
    }
}