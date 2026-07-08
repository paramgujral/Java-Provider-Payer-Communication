package com.feuji.healthcare.fhir.controller;

import com.feuji.healthcare.common.response.ApiResponse;
import com.feuji.healthcare.fhir.dto.FhirClaimDto;
import com.feuji.healthcare.fhir.dto.FhirClaimResponseDto;
import com.feuji.healthcare.fhir.dto.FhirCoverageDto;
import com.feuji.healthcare.fhir.dto.FhirPatientDto;
import com.feuji.healthcare.fhir.service.FhirService;
import com.feuji.healthcare.fhir.standard.claim.FhirClaimResource;
import com.feuji.healthcare.fhir.standard.claimresponse.FhirClaimResponseResource;
import com.feuji.healthcare.fhir.standard.coverage.FhirCoverageResource;
import com.feuji.healthcare.fhir.standard.patient.FhirPatientResource;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/fhir")
@RequiredArgsConstructor
public class FhirController {

    private final FhirService fhirService;

    @GetMapping("/patient/{id}")
    @PreAuthorize(
            "hasAnyRole('ADMIN','PROVIDER','PAYER')")
    public ResponseEntity<
            ApiResponse<FhirPatientDto>>
    getPatient(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                ApiResponse.<FhirPatientDto>builder()
                        .success(true)
                        .message(
                                "FHIR Patient Retrieved Successfully")
                        .data(
                                fhirService
                                        .getPatient(id))
                        .build());
    }

    @GetMapping("/claim/{authorizationId}")
    @PreAuthorize(
            "hasAnyRole('ADMIN','PROVIDER','PAYER')")
    public ResponseEntity<
            ApiResponse<FhirClaimDto>>
    getClaim(
            @PathVariable Long authorizationId) {

        return ResponseEntity.ok(
                ApiResponse.<FhirClaimDto>builder()
                        .success(true)
                        .message(
                                "FHIR Claim Retrieved Successfully")
                        .data(
                                fhirService.getClaim(
                                        authorizationId))
                        .build());
    }


    @GetMapping("/claim-response/{authorizationId}")
    @PreAuthorize(
            "hasAnyRole('ADMIN','PROVIDER','PAYER')")
    public ResponseEntity<
            ApiResponse<FhirClaimResponseDto>>
    getClaimResponse(
            @PathVariable Long authorizationId) {

        return ResponseEntity.ok(
                ApiResponse.<FhirClaimResponseDto>builder()
                        .success(true)
                        .message(
                                "FHIR Claim Response Retrieved Successfully")
                        .data(
                                fhirService
                                        .getClaimResponse(
                                                authorizationId))
                        .build());
    }


    @GetMapping("/coverage/{patientId}")
    @PreAuthorize(
            "hasAnyRole('ADMIN','PROVIDER','PAYER')")
    public ResponseEntity<
            ApiResponse<FhirCoverageDto>>
    getCoverage(
            @PathVariable Long patientId) {

        return ResponseEntity.ok(
                ApiResponse.<FhirCoverageDto>builder()
                        .success(true)
                        .message(
                                "FHIR Coverage Retrieved Successfully")
                        .data(
                                fhirService
                                        .getCoverage(patientId))
                        .build());
    }

    @GetMapping("/standard/patient/{id}")
    @PreAuthorize(
            "hasAnyRole('ADMIN','PROVIDER','PAYER')")
    public ResponseEntity<
            ApiResponse<FhirPatientResource>>
    getStandardPatient(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                ApiResponse.<FhirPatientResource>builder()
                        .success(true)
                        .message(
                                "FHIR Standard Patient Retrieved Successfully")
                        .data(
                                fhirService
                                        .getStandardPatient(id))
                        .build());
    }

    @GetMapping("/standard/claim/{id}")
    public ResponseEntity<ApiResponse<FhirClaimResource>>
    getStandardClaim(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                ApiResponse.<FhirClaimResource>builder()
                        .success(true)
                        .message("FHIR Standard Claim Retrieved")
                        .data(
                                fhirService
                                        .getStandardClaim(id))
                        .build());
    }

    @GetMapping(
            "/standard/claim-response/{id}")
    public ResponseEntity<
            ApiResponse<FhirClaimResponseResource>>
    getStandardClaimResponse(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                ApiResponse
                        .<FhirClaimResponseResource>
                                builder()
                        .success(true)
                        .message(
                                "FHIR Standard Claim Response Retrieved")
                        .data(
                                fhirService
                                        .getStandardClaimResponse(
                                                id))
                        .build());
    }

    @GetMapping("/standard/coverage/{id}")
    public ResponseEntity<
            ApiResponse<FhirCoverageResource>>
    getStandardCoverage(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                ApiResponse
                        .<FhirCoverageResource>
                                builder()
                        .success(true)
                        .message(
                                "FHIR Standard Coverage Retrieved")
                        .data(
                                fhirService
                                        .getStandardCoverage(id))
                        .build());
    }
}