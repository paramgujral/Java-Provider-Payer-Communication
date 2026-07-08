package com.example.healthcareconnector.controller;

import com.example.healthcareconnector.entity.AuthorizationRequest;
import com.example.healthcareconnector.service.AuthorizationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/payer")
public class PayerController {

    private final AuthorizationService authorizationService;

    @GetMapping("/requests")
    public ResponseEntity<List<AuthorizationRequest>> getRequests(){
        return ResponseEntity.ok(authorizationService.getAllRequests());
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<AuthorizationRequest> approve(@PathVariable Long id){
        return ResponseEntity.ok(authorizationService.approveRequest(id));
    }

    @PutMapping("{id}/reject")
    public ResponseEntity<AuthorizationRequest> reject(@PathVariable Long id, @RequestParam String reason){
        return ResponseEntity.ok(authorizationService.rejectRequest(id, reason));
    }
}
