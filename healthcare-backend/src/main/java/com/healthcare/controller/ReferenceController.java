package com.healthcare.controller;

import com.healthcare.dto.MedicalCodeDto;
import com.healthcare.dto.PayerDto;
import com.healthcare.service.ReferenceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/reference")
@RequiredArgsConstructor
public class ReferenceController {

    private final ReferenceService referenceService;

    @GetMapping("/diagnosis")
    public ResponseEntity<List<MedicalCodeDto>> searchDiagnosis(@RequestParam(value = "query", required = false) String query) {
        return ResponseEntity.ok(referenceService.searchDiagnosisCodes(query));
    }

    @GetMapping("/procedures")
    public ResponseEntity<List<MedicalCodeDto>> searchProcedures(@RequestParam(value = "query", required = false) String query) {
        return ResponseEntity.ok(referenceService.searchProcedureCodes(query));
    }

    @GetMapping("/payers")
    public ResponseEntity<List<PayerDto>> getPayers() {
        return ResponseEntity.ok(referenceService.getPayers());
    }
}
