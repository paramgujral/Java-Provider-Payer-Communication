package com.healthcare.connector.controller;

import com.healthcare.connector.dto.AuthorizationRequestDto;
import com.healthcare.connector.entity.RequestStatus;
import com.healthcare.connector.service.AuthorizationRequestService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payer/requests")
@CrossOrigin(origins = "*", maxAge = 3600)
@PreAuthorize("hasRole('Payer')")
public class PayerController {

    private final AuthorizationRequestService requestService;

    public PayerController(AuthorizationRequestService requestService) {
        this.requestService = requestService;
    }

    @GetMapping("/all")
    public ResponseEntity<List<AuthorizationRequestDto>> getAllRequests() {
        return ResponseEntity.ok(requestService.getAllRequests());
    }
    
    @GetMapping("/payerId")
    public ResponseEntity<List<AuthorizationRequestDto>> getAllRequests(@RequestParam Long payerId) {
        return ResponseEntity.ok(requestService.getRequestsByPayer(payerId));
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<AuthorizationRequestDto> approveRequest(@PathVariable Long id, @RequestParam Long payerId) {
        return ResponseEntity.ok(requestService.updateStatus(id, RequestStatus.APPROVED, payerId));
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<AuthorizationRequestDto> rejectRequest(@PathVariable Long id, @RequestParam Long payerId) {
        return ResponseEntity.ok(requestService.updateStatus(id, RequestStatus.REJECTED, payerId));
    }
}
