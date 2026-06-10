package com.example.demo.controller;


import com.example.demo.dto.AIReviewResponseDTO;
import com.example.demo.dto.AuthorizationRequestDTO;
import com.example.demo.dto.StatusUpdateDTO;
import com.example.demo.model.AuthorizationRequest;
import com.example.demo.services.AICopilotService;
import com.example.demo.services.AuthorizationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class AuthorizationController {

    private final AuthorizationService authorizationService;
    private final AICopilotService aiCopilotService;

    /**
     * Submit Authorization Request
     * POST /api/provider/submit
     */
//    @PostMapping("/provider/submit")
//    public AuthorizationRequest submitRequest(
//            @RequestBody AuthorizationRequestDTO dto) {
//
//        return authorizationService.submitRequest(dto);
//    }
//
//    /**
//     * Provider Tracks Own Requests
//     * GET /api/provider/requests/{providerId}
//     */
//    @GetMapping("/provider/requests/{providerId}")
//    public List<AuthorizationRequest> getProviderRequests(
//            @PathVariable Long providerId) {
//
//        return authorizationService.getProviderRequests(providerId);
//    }
//
//    /**
//     * Payer Views All Requests
//     * GET /api/payer/requests
//     */
//    @GetMapping("/payer/requests")
//    public List<AuthorizationRequest> getAllRequests() {
//
//        return authorizationService.getAllRequests();
//    }
//
//    /**
//     * Payer Approve/Reject Request
//     * PUT /api/payer/requests/{id}/status
//     */
//    @PutMapping("/payer/requests/{id}/status")
//    public AuthorizationRequest updateStatus(
//            @PathVariable Long id,
//            @RequestBody StatusUpdateDTO dto) {
//
//        return authorizationService.updateRequestStatus(
//                id,
//                dto.getStatus(),
//                dto.getPayerRemarks()
//        );
//    }
//
//    /**
//     * Get Request By Id
//     */
//    @GetMapping("/requests/{id}")
//    public AuthorizationRequest getRequestById(
//            @PathVariable Long id) {
//
//        return authorizationService.getRequestById(id);
//    }

    @PostMapping("/review")
    public AIReviewResponseDTO reviewBeforeSubmit(
             @RequestBody AuthorizationRequestDTO dto) {

        return aiCopilotService.reviewRequest(dto);
    }
}
