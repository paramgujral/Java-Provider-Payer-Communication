package com.healthcare.payer.controller;

import com.healthcare.payer.dto.RejectRequest;
import com.healthcare.payer.entity.PayerRequest;
import com.healthcare.payer.service.PayerService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/payer")
@RequiredArgsConstructor
public class PayerController {

    private final PayerService service;

    @PostMapping("/requests")
    public PayerRequest create(
            @RequestBody PayerRequest request) {

        return service.save(request);
    }

    @GetMapping("/requests")
    public List<PayerRequest> getAll() {

        return service.getAll();
    }

    @PutMapping("/requests/{id}/approve")
    public PayerRequest approve(
            @PathVariable Long id) {

        return service.approve(id);
    }

    @PutMapping("/requests/{id}/reject")
    public PayerRequest reject(
            @PathVariable Long id,
            @RequestBody RejectRequest request) {

        return service.reject(
                id,
                request.getComments());
    }
}