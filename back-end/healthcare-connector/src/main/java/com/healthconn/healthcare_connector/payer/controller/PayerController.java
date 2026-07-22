package com.healthconn.healthcare_connector.payer.controller;

import com.healthconn.healthcare_connector.authentication.entity.User;
import com.healthconn.healthcare_connector.fhir.FhirMapper;
import com.healthconn.healthcare_connector.fhir.FhirMediaTypes;
import com.healthconn.healthcare_connector.payer.dto.ReviewRequestDto;
import com.healthconn.healthcare_connector.payer.service.PayerService;
import com.healthconn.healthcare_connector.provider.dto.AuthRequestResponseDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * FHIR payer workflow:
 * review queue  -> GET /fhir/ServiceRequest/$queue
 * decision      -> POST /fhir/ClaimResponse
 * history       -> GET /fhir/ServiceRequest/$history
 */
@RestController
@RequestMapping(produces = {FhirMediaTypes.FHIR_JSON, FhirMediaTypes.JSON})
@RequiredArgsConstructor
public class PayerController {

    private final PayerService payerService;
    private final FhirMapper fhirMapper;

    @GetMapping("/fhir/ServiceRequest/$queue")
    @PreAuthorize("hasAnyRole('PAYER', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> getReviewQueue() {
        List<AuthRequestResponseDto> requests = payerService.getReviewQueue();
        List<Map<String, Object>> entries = new ArrayList<Map<String, Object>>();
        for (AuthRequestResponseDto request : requests) {
            entries.add(fhirMapper.toServiceRequest(request));
        }
        return ResponseEntity.ok(fhirMapper.toBundle("searchset", entries));
    }

    @GetMapping("/fhir/ServiceRequest/$history")
    public ResponseEntity<Map<String, Object>> getRequestHistory() {
        List<AuthRequestResponseDto> requests = payerService.getRequestHistory();
        List<Map<String, Object>> entries = new ArrayList<Map<String, Object>>();
        for (AuthRequestResponseDto request : requests) {
            entries.add(fhirMapper.toServiceRequest(request));
        }
        return ResponseEntity.ok(fhirMapper.toBundle("searchset", entries));
    }

    @PostMapping(value = "/fhir/ClaimResponse",
            consumes = {FhirMediaTypes.FHIR_JSON, FhirMediaTypes.JSON})
    @PreAuthorize("hasRole('PAYER')")
    public ResponseEntity<Map<String, Object>> updateRequestReview(
            @RequestBody Map<String, Object> claimResponse,
            @AuthenticationPrincipal User currentUser) {
        Long requestId = fhirMapper.extractServiceRequestId(claimResponse);
        ReviewRequestDto dto = fhirMapper.toReviewRequest(claimResponse);
        AuthRequestResponseDto updated =
                payerService.updateRequestReview(requestId, dto, currentUser.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(fhirMapper.toClaimResponse(updated));
    }
}
