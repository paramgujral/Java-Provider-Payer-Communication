package com.healthcare.connector.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.healthcare.connector.entity.AuthorizationRequest;
import com.healthcare.connector.fhir.FHIRService;
import com.healthcare.connector.repository.AuthorizationRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AuthorizationService {

    private final AuthorizationRepository repository;
    private final GeminiService geminiService;
    private final FHIRService fhirService;
    public AuthorizationService(AuthorizationRepository repository, GeminiService geminiService, FHIRService fhirService) {
        this.repository = repository;
        this.geminiService = geminiService;
        this.fhirService = fhirService;
    }

    // Provider submits Authorization Request
    public AuthorizationRequest createRequest(AuthorizationRequest request) throws JsonProcessingException {

        request.setStatus("Pending");

        // Generate FHIR JSON
        String fhirJson = fhirService.generateClaim(request);
        request.setFhirJson(fhirJson);

        // Gemini Review
        String review = geminiService.reviewRequest(request);
        request.setAiReview(review);

        return repository.save(request);
    }
    // Provider & Payer View All Requests
    public List<AuthorizationRequest> getAllRequests() {
        return repository.findAll();
    }

    // View Single Request
    public AuthorizationRequest getRequest(Long id) {

        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Authorization Request Not Found"));
    }

    // Payer Approves Request
    public AuthorizationRequest approve(Long id) {

        AuthorizationRequest request = getRequest(id);

        request.setStatus("Approved");

        return repository.save(request);
    }

    // Payer Rejects Request
    public AuthorizationRequest reject(Long id) {

        AuthorizationRequest request = getRequest(id);

        request.setStatus("Rejected");

        return repository.save(request);
    }

    // Delete Request
    public void deleteRequest(Long id) {

        repository.deleteById(id);
    }
}