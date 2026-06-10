package com.feuji.healthcare_connector.controller;

import com.feuji.healthcare_connector.entity.AuthorizationCommunication;
import com.feuji.healthcare_connector.service.CommunicationService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/communications")
public class CommunicationController {

    private final CommunicationService service;

    public CommunicationController(CommunicationService service) {
        this.service = service;
    }

    @GetMapping
    public List<AuthorizationCommunication> getAll() {
        return service.getAll();
    }

    @GetMapping("/request/{requestId}")
    public List<AuthorizationCommunication> getByRequestId(@PathVariable Long requestId) {
        return service.getByRequestId(requestId);
    }
}