package com.healthcare.connector.controller;

import com.healthcare.connector.dto.AuthorizationRequest;
import com.healthcare.connector.model.AuthorizationCase;
import com.healthcare.connector.service.AuthorizationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/authorization")
@Tag(name = "Authorization", description = "FHIR Authorization Request endpoints")
@SecurityRequirement(name = "bearerAuth")
public class AuthorizationController {

    @Autowired
    private AuthorizationService authorizationService;

    @PostMapping("/create")
    @Operation(summary = "Create a draft authorization request")
    public ResponseEntity<?> createDraft(@RequestBody AuthorizationRequest request,
                                          Authentication authentication) {
        try {
            AuthorizationCase aCase = authorizationService.createDraft(request, authentication.getName());
            return ResponseEntity.ok(caseToMap(aCase));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/analyze")
    @Operation(summary = "AI dry-run analysis (no persistence)")
    public ResponseEntity<?> analyze(@RequestBody AuthorizationRequest request) {
        return ResponseEntity.ok(authorizationService.analyze(request));
    }

    @PostMapping("/{caseId}/submit")
    @Operation(summary = "Submit draft to payer queue")
    public ResponseEntity<?> submit(@PathVariable String caseId, Authentication authentication) {
        try {
            AuthorizationCase aCase = authorizationService.submit(caseId, authentication.getName());
            return ResponseEntity.ok(caseToMap(aCase));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{caseId}/ai-fix")
    @Operation(summary = "Run AI auto-fix suggestions on a case")
    public ResponseEntity<?> aiFix(@PathVariable String caseId, Authentication authentication) {
        return ResponseEntity.ok(authorizationService.applyAiFix(caseId, authentication.getName()));
    }

    @PostMapping("/{caseId}/review")
    @Operation(summary = "Payer reviews and adjudicates a case")
    public ResponseEntity<?> review(@PathVariable String caseId,
                                     @RequestBody Map<String, String> body,
                                     Authentication authentication) {
        try {
            AuthorizationCase aCase = authorizationService.review(
                    caseId, body.get("decision"), body.get("payerNotes"),
                    body.get("clarificationRequested"), authentication.getName());
            return ResponseEntity.ok(caseToMap(aCase));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{caseId}/clarification")
    @Operation(summary = "Provider submits clarification response")
    public ResponseEntity<?> clarification(@PathVariable String caseId,
                                            @RequestBody Map<String, String> body,
                                            Authentication authentication) {
        try {
            AuthorizationCase aCase = authorizationService.submitClarification(
                    caseId, body.get("notes"), authentication.getName());
            return ResponseEntity.ok(caseToMap(aCase));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/provider/dashboard")
    @Operation(summary = "Provider KPI dashboard")
    public ResponseEntity<?> providerDashboard(Authentication authentication) {
        return ResponseEntity.ok(authorizationService.providerDashboard(authentication.getName()));
    }

    @GetMapping("/payer/dashboard")
    @Operation(summary = "Payer auto-adjudication stats dashboard")
    public ResponseEntity<?> payerDashboard() {
        return ResponseEntity.ok(authorizationService.payerDashboard());
    }

    @GetMapping("/provider/cases")
    @Operation(summary = "List provider's own cases")
    public ResponseEntity<?> providerCases(Authentication authentication) {
        List<AuthorizationCase> cases = authorizationService.getProviderCases(authentication.getName());
        return ResponseEntity.ok(cases.stream().map(this::caseToMap).toList());
    }

    @GetMapping("/payer/cases")
    @Operation(summary = "List all submitted cases (payer view)")
    public ResponseEntity<?> payerCases() {
        List<AuthorizationCase> cases = authorizationService.getPayerCases();
        return ResponseEntity.ok(cases.stream().map(this::caseToMap).toList());
    }

    @GetMapping("/kanban")
    @Operation(summary = "FHIR Kanban board across all 5 statuses")
    public ResponseEntity<?> kanban() {
        return ResponseEntity.ok(authorizationService.getKanban());
    }

    @GetMapping("/{caseId}")
    @Operation(summary = "Get case detail by caseId")
    public ResponseEntity<?> getCase(@PathVariable String caseId) {
        try {
            return ResponseEntity.ok(caseToMap(authorizationService.getCase(caseId)));
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    private Map<String, Object> caseToMap(AuthorizationCase c) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("caseId", c.getCaseId());
        map.put("patientName", c.getPatientName());
        map.put("patientDob", c.getPatientDob());
        map.put("patientGender", c.getPatientGender());
        map.put("patientMemberId", c.getPatientMemberId());
        map.put("npiNumber", c.getNpiNumber());
        map.put("providerName", c.getProviderName());
        map.put("icd10Code", c.getIcd10Code());
        map.put("diagnosisDescription", c.getDiagnosisDescription());
        map.put("cptCode", c.getCptCode());
        map.put("procedureDescription", c.getProcedureDescription());
        map.put("clinicalNotes", c.getClinicalNotes());
        map.put("insuranceId", c.getInsuranceId());
        map.put("insurancePlan", c.getInsurancePlan());
        map.put("urgencyLevel", c.getUrgencyLevel());
        map.put("aiRiskScore", c.getAiRiskScore());
        map.put("aiRiskLevel", c.getAiRiskLevel());
        map.put("aiAnalysis", c.getAiAnalysis());
        map.put("status", c.getStatus().name());
        map.put("providerUsername", c.getProvider().getUsername());
        map.put("providerFullName", c.getProvider().getFullName());
        map.put("payerDecision", c.getPayerDecision());
        map.put("payerNotes", c.getPayerNotes());
        map.put("clarificationRequested", c.getClarificationRequested());
        map.put("createdAt", c.getCreatedAt() != null ? c.getCreatedAt().toString() : null);
        map.put("submittedAt", c.getSubmittedAt() != null ? c.getSubmittedAt().toString() : null);
        map.put("updatedAt", c.getUpdatedAt() != null ? c.getUpdatedAt().toString() : null);
        return map;
    }
}
