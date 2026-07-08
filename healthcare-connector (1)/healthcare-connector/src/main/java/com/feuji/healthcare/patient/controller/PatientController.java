package com.feuji.healthcare.patient.controller;

import com.feuji.healthcare.common.response.ApiResponse;
import com.feuji.healthcare.patient.dto.PatientRequestDto;
import com.feuji.healthcare.patient.dto.PatientResponseDto;
import com.feuji.healthcare.patient.service.PatientService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/patients")
@RequiredArgsConstructor
public class PatientController {

    private final PatientService patientService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','PROVIDER')")
    public ResponseEntity<ApiResponse<PatientResponseDto>>
    createPatient(
            @RequestBody PatientRequestDto request) {

        return ResponseEntity.ok(
                ApiResponse.<PatientResponseDto>builder()
                        .success(true)
                        .message("Patient created successfully")
                        .data(patientService.createPatient(request))
                        .build()
        );
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','PROVIDER','PAYER')")
    public ResponseEntity<ApiResponse<List<PatientResponseDto>>>
    getAllPatients() {

        return ResponseEntity.ok(
                ApiResponse.<List<PatientResponseDto>>builder()
                        .success(true)
                        .message("Patients fetched successfully")
                        .data(patientService.getAllPatients())
                        .build()
        );
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','PROVIDER','PAYER')")
    public ResponseEntity<ApiResponse<PatientResponseDto>>
    getPatientById(@PathVariable Long id) {

        return ResponseEntity.ok(
                ApiResponse.<PatientResponseDto>builder()
                        .success(true)
                        .message("Patient fetched successfully")
                        .data(patientService.getPatientById(id))
                        .build()
        );
    }
}
