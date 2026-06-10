package com.feignClient.Controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.feignClient.Auth.AuthorizationRequest;
import com.feignClient.Service.AuthorizationRequestService;
import com.feignClient.dto.DashboardDto;
import com.feignClient.dto.RejectRequestDto;

@RestController
@RequestMapping("/api/payer")
@CrossOrigin(origins = "http://localhost:5173")
public class PayerController {

    @Autowired
    private AuthorizationRequestService service;

    // =========================
    // GET ALL REQUESTS
    // =========================
    @GetMapping("/all")
    public ResponseEntity<List<AuthorizationRequest>> getAllRequests() {
        return ResponseEntity.ok(service.getAllRequests());
    }

    // =========================
    // APPROVE REQUEST
    // =========================
    @PutMapping("/approve/{id}")
    public ResponseEntity<AuthorizationRequest> approveRequest(
            @PathVariable Long id) {

        AuthorizationRequest response = service.approveRequest(id);
        return ResponseEntity.ok(response);
    }

    // =========================
    // REJECT REQUEST
    // =========================
    @PutMapping("/reject/{id}")
    public ResponseEntity<AuthorizationRequest> reject(
            @PathVariable Long id,
            @RequestBody RejectRequestDto request) {

        if (request.getComment() == null || request.getComment().isBlank()) {
            throw new RuntimeException("Rejection comment is required");
        }

        AuthorizationRequest response =
                service.rejectRequest(id, request.getComment());

        return ResponseEntity.ok(response);
    }
    
    
    @GetMapping("/dashboard")
    public ResponseEntity<DashboardDto> getDashboard() {
        return ResponseEntity.ok(service.getDashboardStats());
    }
}