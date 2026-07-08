package com.healthconnector.controller;

import com.healthconnector.dto.ValidationResultDto;
import com.healthconnector.model.AuthorizationRequest;
import com.healthconnector.service.AuthorizationService;
import com.healthconnector.service.CopilotValidator;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/provider")
public class ProviderController {

    private final CopilotValidator copilotValidator;
    private final AuthorizationService authorizationService;
    private final CurrentUserResolver currentUserResolver;

    public ProviderController(CopilotValidator copilotValidator,
                               AuthorizationService authorizationService,
                               CurrentUserResolver currentUserResolver) {
        this.copilotValidator = copilotValidator;
        this.authorizationService = authorizationService;
        this.currentUserResolver = currentUserResolver;
    }

    @PostMapping("/validate")
    public ResponseEntity<ValidationResultDto> validate(@RequestBody AuthorizationRequest request) {
        return ResponseEntity.ok(copilotValidator.validate(request));
    }

    @PostMapping("/requests")
    public ResponseEntity<AuthorizationRequest> submit(@RequestBody AuthorizationRequest request,
                                                        @RequestHeader("Authorization") String authHeader) {
        // Defense in depth: re-validate server-side even though the UI already
        // ran the copilot check, so a request can never be submitted invalid.
        ValidationResultDto validation = copilotValidator.validate(request);
        if (!validation.isValid()) {
            return ResponseEntity.badRequest().build();
        }
        String providerUsername = currentUserResolver.usernameFromHeader(authHeader);
        AuthorizationRequest saved = authorizationService.submit(request, providerUsername);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/requests")
    public ResponseEntity<List<AuthorizationRequest>> myRequests(@RequestHeader("Authorization") String authHeader) {
        String providerUsername = currentUserResolver.usernameFromHeader(authHeader);
        return ResponseEntity.ok(authorizationService.findByProvider(providerUsername));
    }
}
