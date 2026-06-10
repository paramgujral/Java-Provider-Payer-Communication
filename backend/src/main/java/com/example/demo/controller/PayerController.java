package com.example.demo.controller;


import com.example.demo.dto.StatusUpdateDTO;
import com.example.demo.model.AuthorizationRequest;
import com.example.demo.model.Payer;
import com.example.demo.services.AuthorizationService;
import com.example.demo.services.PayserService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payer")
public class PayerController {

    private final AuthorizationService authorizationService;
    private final PayserService payerService;

    public PayerController(AuthorizationService authorizationService, PayserService payerService) {
        this.authorizationService = authorizationService;
        this.payerService = payerService;
    }

    @GetMapping("/requests")
    public List<AuthorizationRequest> getAllRequests() {

        return authorizationService.getAllRequests();
    }

    @GetMapping("/requests/{payerId}")
    public List<AuthorizationRequest> getAllRequestsByPayerId(@PathVariable Long payerId) {

        return authorizationService.getAllRequestsByPayerId(payerId);
    }

    @PutMapping("/requests/{id}/status")
    public AuthorizationRequest updateRequestStatus(
            @PathVariable Long id,
            @RequestBody StatusUpdateDTO dto) {

        return authorizationService.updateRequestStatus(
                id,
                dto.getStatus(),
                dto.getPayerRemarks()
        );
    }

    @GetMapping("/{payerId}/requests/pending")
    public List<AuthorizationRequest> getPendingRequests(
            @PathVariable Long payerId) {

        return authorizationService.getPendingRequests(payerId);
    }
    @GetMapping
    public List<Payer> getAllPayers(){
        return payerService.getAllPayers();
    }

}
