package com.healthcare.provider.controller;

import com.healthcare.provider.dto.StatusUpdateRequest;
import com.healthcare.provider.entity.AuthorizationRequest;
import com.healthcare.provider.entity.Notification;
import com.healthcare.provider.repository.NotificationRepository;
import com.healthcare.provider.service.AuthorizationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.List;

@RestController
@RequestMapping("/provider")
@RequiredArgsConstructor
public class AuthorizationController {

    private final AuthorizationService service;
    private final NotificationRepository notificationRepository;


    @PostMapping("/requests")
    public AuthorizationRequest create(
            @Valid @RequestBody AuthorizationRequest request) {

        return service.create(request);
    }

    @GetMapping("/requests")
    public List<AuthorizationRequest> getAll() {

        return service.getAll();
    }

    @GetMapping("/requests/{id}")
    public AuthorizationRequest getById(
            @PathVariable Long id) {

        return service.getById(id);
    }

    @PostMapping("/requests/{id}/review")
    public AuthorizationRequest reviewWithAi(
            @PathVariable Long id) {

        return service.reviewWithAi(id);
    }

    @PostMapping("/requests/{id}/submit")
    public AuthorizationRequest submitToPayer(
            @PathVariable Long id) {

        return service.submitToPayer(id);
    }

    @PutMapping("/requests/{id}/status")
    public AuthorizationRequest updateStatus(
            @PathVariable Long id,
            @RequestBody StatusUpdateRequest request) {

        return service.updateStatus(
                id,
                request.getStatus(),
                request.getComments());
    }

    @GetMapping("/notifications")
    public List<Notification> getNotifications() {

        return notificationRepository.findAll();
    }

    @PutMapping("/requests/{id}")
    public AuthorizationRequest update(
            @PathVariable Long id,
            @Valid @RequestBody AuthorizationRequest request) {

        return service.update(id, request);
    }
}