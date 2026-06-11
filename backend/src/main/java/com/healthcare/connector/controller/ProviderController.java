package com.healthcare.connector.controller;

import com.healthcare.connector.dto.AuthorizationRequestDto;
import com.healthcare.connector.entity.RequestStatus;
import com.healthcare.connector.service.AuthorizationRequestService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/provider/requests")
@CrossOrigin(origins = "*", maxAge = 3600)
@PreAuthorize("hasRole('Provider')")
public class ProviderController {

    private final AuthorizationRequestService requestService;

    public ProviderController(AuthorizationRequestService requestService) {
        this.requestService = requestService;
    }

    @PostMapping("/add")
    public ResponseEntity<AuthorizationRequestDto> createRequest(@RequestBody AuthorizationRequestDto requestDto) {
        return ResponseEntity.ok(requestService.createRequest(requestDto));
    }

    @GetMapping("/all")
    public ResponseEntity<List<AuthorizationRequestDto>> getAllRequests() {
        return ResponseEntity.ok(requestService.getAllRequests());
    }
    
    @GetMapping("/get")
    public ResponseEntity<List<AuthorizationRequestDto>> getMyRequests(@RequestParam Long requestId) {
        return ResponseEntity.ok(requestService.getRequestsByProvider(requestId));
    }
    @PutMapping("/{requestId}")
    public ResponseEntity<AuthorizationRequestDto> updateRequest(
            @PathVariable Long requestId,
            @RequestBody AuthorizationRequestDto requestDto) {

        return ResponseEntity.ok(
                requestService.updateRequest(requestId, requestDto));
    }

    @PostMapping("/{id}/submit")
    public ResponseEntity<AuthorizationRequestDto> submitRequest(@PathVariable Long id, @RequestParam Long providerId) {
        return ResponseEntity.ok(requestService.updateStatus(id, RequestStatus.SUBMITTED, providerId));
    }
}
