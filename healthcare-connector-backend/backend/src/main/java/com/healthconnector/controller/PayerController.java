package com.healthconnector.controller;

import com.healthconnector.dto.DecisionRequestDto;
import com.healthconnector.model.AuthorizationRequest;
import com.healthconnector.service.AuthorizationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payer")
public class PayerController {

    private final AuthorizationService authorizationService;

    public PayerController(AuthorizationService authorizationService) {
        this.authorizationService = authorizationService;
    }

    @GetMapping("/requests")
    public ResponseEntity<List<AuthorizationRequest>> incoming() {
        return ResponseEntity.ok(authorizationService.findAllForPayer());
    }

    @PostMapping("/requests/{id}/decision")
    public ResponseEntity<AuthorizationRequest> decide(@PathVariable Long id,
                                                        @RequestBody DecisionRequestDto decision) {
        AuthorizationRequest updated = authorizationService.decide(id, decision.getDecision(), decision.getNotes());
        return ResponseEntity.ok(updated);
    }
}
