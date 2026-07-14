package com.feuji.healthcare_connector.controller;

import com.feuji.healthcare_connector.dto.request.CreateRequestDto;
import com.feuji.healthcare_connector.dto.response.*;
import com.feuji.healthcare_connector.entity.*;
import com.feuji.healthcare_connector.enums.RequestStatus;
import com.feuji.healthcare_connector.exception.ResourceNotFoundException;
import com.feuji.healthcare_connector.exception.UnauthorizedException;
import com.feuji.healthcare_connector.repository.UserRepository;
import com.feuji.healthcare_connector.service.AuthorizationRequestService;
import com.feuji.healthcare_connector.service.DocumentService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.security.Principal;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/requests")
public class AuthorizationRequestController {

    @Autowired
    private AuthorizationRequestService requestService;

    @Autowired
    private DocumentService documentService;

    @Autowired
    private UserRepository userRepository;

    @PostMapping
    public ResponseEntity<ApiResponse<RequestDetailsResponse>> createRequest(
            @Valid @RequestBody CreateRequestDto dto,
            Principal principal
    ) {
        User provider = getAuthenticatedUser(principal);
        AuthorizationRequest req = requestService.createRequest(dto, provider);
        RequestDetailsResponse response = requestService.getRequestDetails(req.getId(), provider);
        return ResponseEntity.ok(new ApiResponse<>(true, "Request created successfully", response));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<RequestDetailsResponse>> updateRequest(
            @PathVariable Long id,
            @Valid @RequestBody CreateRequestDto dto,
            Principal principal
    ) {
        User provider = getAuthenticatedUser(principal);
        AuthorizationRequest req = requestService.updateRequest(id, dto, provider);
        RequestDetailsResponse response = requestService.getRequestDetails(req.getId(), provider);
        return ResponseEntity.ok(new ApiResponse<>(true, "Request updated successfully", response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<RequestDetailsResponse>> getRequestDetails(
            @PathVariable Long id,
            Principal principal
    ) {
        User user = getAuthenticatedUser(principal);
        RequestDetailsResponse response = requestService.getRequestDetails(id, user);
        return ResponseEntity.ok(new ApiResponse<>(true, "Request details retrieved successfully", response));
    }

    @GetMapping("/provider")
    public ResponseEntity<ApiResponse<List<RequestDetailsResponse>>> getProviderRequests(Principal principal) {
        User provider = getAuthenticatedUser(principal);
        List<RequestDetailsResponse> response = requestService.getProviderRequests(provider);
        return ResponseEntity.ok(new ApiResponse<>(true, "Provider requests retrieved successfully", response));
    }

    @GetMapping("/payer")
    public ResponseEntity<ApiResponse<List<RequestDetailsResponse>>> getPayerRequests(Principal principal) {
        User payer = getAuthenticatedUser(principal);
        List<RequestDetailsResponse> response = requestService.getPayerRequests(payer);
        return ResponseEntity.ok(new ApiResponse<>(true, "Payer requests retrieved successfully", response));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<RequestDetailsResponse>> updateRequestStatus(
            @PathVariable Long id,
            @RequestParam RequestStatus status,
            @RequestParam(required = false) String remarks,
            Principal principal
    ) {
        User payer = getAuthenticatedUser(principal);
        AuthorizationRequest req = requestService.updateStatusByPayer(id, status, remarks, payer);
        RequestDetailsResponse response = requestService.getRequestDetails(req.getId(), payer);
        return ResponseEntity.ok(new ApiResponse<>(true, "Request status updated successfully", response));
    }

    @GetMapping("/dashboard/provider")
    public ResponseEntity<ApiResponse<ProviderDashboardStats>> getProviderDashboard(Principal principal) {
        User provider = getAuthenticatedUser(principal);
        ProviderDashboardStats response = requestService.getProviderDashboardStats(provider);
        return ResponseEntity.ok(new ApiResponse<>(true, "Provider dashboard stats retrieved successfully", response));
    }

    @GetMapping("/dashboard/payer")
    public ResponseEntity<ApiResponse<PayerDashboardStats>> getPayerDashboard(Principal principal) {
        User payer = getAuthenticatedUser(principal);
        PayerDashboardStats response = requestService.getPayerDashboardStats(payer);
        return ResponseEntity.ok(new ApiResponse<>(true, "Payer dashboard stats retrieved successfully", response));
    }

    @GetMapping("/payers")
    public ResponseEntity<ApiResponse<List<PayerLookupResponse>>> getPayers() {
        List<User> payers = requestService.getRegisteredPayers();
        List<PayerLookupResponse> response = payers.stream()
                .map(p -> new PayerLookupResponse(p.getId(), p.getName(), p.getOrganizationName()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(new ApiResponse<>(true, "Payers retrieved successfully", response));
    }

    @PostMapping("/{id}/documents")
    public ResponseEntity<ApiResponse<String>> uploadDocument(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file,
            Principal principal
    ) throws IOException {
        User user = getAuthenticatedUser(principal);
        // Fetch request to verify authorization
        RequestDetailsResponse reqDetails = requestService.getRequestDetails(id, user);
        
        // Load the actual entity
        AuthorizationRequest req = new AuthorizationRequest();
        req.setId(reqDetails.getId());
        
        documentService.saveFile(file, req);
        requestService.regenerateFhirBundle(id);
        
        return ResponseEntity.ok(new ApiResponse<>(true, "Document uploaded successfully."));
    }

    @GetMapping("/documents/{documentId}")
    public ResponseEntity<Resource> downloadDocument(
            @PathVariable Long documentId,
            Principal principal
    ) {
        User user = getAuthenticatedUser(principal);
        Resource file = documentService.loadFileAsResource(documentId);
        
        String filename = file.getFilename();
        if (filename != null && filename.contains("_")) {
            filename = filename.substring(filename.indexOf("_") + 1);
        } else {
            filename = "document";
        }
        
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .body(file);
    }

    private User getAuthenticatedUser(Principal principal) {
        if (principal == null) {
            throw new UnauthorizedException("User is not authenticated.");
        }
        return userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + principal.getName()));
    }

    public static class PayerLookupResponse {
        private Long id;
        private String name;
        private String organizationName;

        public PayerLookupResponse(Long id, String name, String organizationName) {
            this.id = id;
            this.name = name;
            this.organizationName = organizationName;
        }

        public Long getId() { return id; }
        public String getName() { return name; }
        public String getOrganizationName() { return organizationName; }
    }
}
