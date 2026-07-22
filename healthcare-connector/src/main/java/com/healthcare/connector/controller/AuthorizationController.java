package com.healthcare.connector.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.healthcare.connector.entity.AuthorizationRequest;
import com.healthcare.connector.service.AIService;
import com.healthcare.connector.service.AuthorizationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import com.healthcare.connector.fhir.FHIRService;
import java.util.Map;
@RestController
@RequestMapping("/api/request")
@CrossOrigin(origins = "http://localhost:4200")
public class AuthorizationController {

    private final AuthorizationService service;
    private final FHIRService fhirService;
    private final AIService aiService;
    public AuthorizationController(AuthorizationService service, FHIRService fhirService, AIService aiService) {
        this.service = service;
        this.fhirService = fhirService;
        this.aiService = aiService;
    }

    @PostMapping
    public AuthorizationRequest createRequest(@RequestBody AuthorizationRequest request) throws JsonProcessingException {
        return service.createRequest(request);
    }

    @GetMapping
    public List<AuthorizationRequest> getAllRequests() {
        return service.getAllRequests();
    }

    @PutMapping("/{id}/approve")
    public AuthorizationRequest approve(@PathVariable Long id) {
        return service.approve(id);
    }

    @PutMapping("/{id}/reject")
    public AuthorizationRequest reject(@PathVariable Long id) {
        return service.reject(id);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteRequest(@PathVariable Long id) {
        service.deleteRequest(id);
        return ResponseEntity.ok("Request deleted successfully");
    }


    @GetMapping("/{id}/fhir")
    public String getFhir(@PathVariable Long id) {
        return service.getRequest(id).getFhirJson();
    }

    @GetMapping("/{id}/review")
    public String getReview(@PathVariable Long id) {
        return service.getRequest(id).getAiReview();
    }
    @PostMapping("/review")
    public List<String> reviewRequest(@RequestBody AuthorizationRequest request) {

        return aiService.reviewRequest(request);

    }
}