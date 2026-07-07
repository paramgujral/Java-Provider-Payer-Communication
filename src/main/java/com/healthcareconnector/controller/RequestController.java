package com.healthcareconnector.controller;

import com.healthcareconnector.dto.DecisionRequest;
import com.healthcareconnector.dto.NewRequestDTO;
import com.healthcareconnector.model.AIReview;
import com.healthcareconnector.model.AuthorizationRequest;
import com.healthcareconnector.model.HistoryEntry;
import com.healthcareconnector.model.Notification;
import com.healthcareconnector.service.AiCopilotService;
import com.healthcareconnector.service.DataStore;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/requests")
public class RequestController {

    private final DataStore dataStore;
    private final AiCopilotService aiCopilotService;

    public RequestController(DataStore dataStore, AiCopilotService aiCopilotService) {
        this.dataStore = dataStore;
        this.aiCopilotService = aiCopilotService;
    }

    // ---------- Create (Draft) ----------
    @PostMapping
    public ResponseEntity<?> createRequest(@RequestBody NewRequestDTO dto) {
        String now = Instant.now().toString();

        AuthorizationRequest reqObj = new AuthorizationRequest();
        reqObj.setId(UUID.randomUUID().toString());
        reqObj.setPatientName(dto.getPatientName());
        reqObj.setDob(dto.getDob());
        reqObj.setProcedureCode(dto.getProcedureCode());
        reqObj.setDiagnosisCode(dto.getDiagnosisCode());
        reqObj.setProvider(dto.getProvider());
        reqObj.setProviderUsername(dto.getProviderUsername());
        reqObj.setPayer(dto.getPayer());
        reqObj.setPayerUsername(dto.getPayerUsername());
        reqObj.setUrgency(dto.getUrgency());
        reqObj.setNotes(dto.getNotes());
        reqObj.setStatus("Draft");
        reqObj.setCreatedAt(now);
        reqObj.setUpdatedAt(now);
        reqObj.getHistory().add(new HistoryEntry("Draft", "Request created.", now));

        dataStore.getDatabase().getRequests().add(reqObj);
        dataStore.save();

        return ResponseEntity.status(201).body(reqObj);
    }

    // ---------- AI Copilot validate ----------
    @PostMapping("/{id}/validate")
    public ResponseEntity<?> validate(@PathVariable String id) {
        AuthorizationRequest reqObj = findRequest(id);
        if (reqObj == null) return notFound();

        AIReview review = aiCopilotService.reviewRequest(reqObj);
        reqObj.setAiReview(review);
        reqObj.setUpdatedAt(Instant.now().toString());
        dataStore.save();

        return ResponseEntity.ok(review);
    }

    // ---------- Submit (Draft -> Pending) ----------
    @PostMapping("/{id}/submit")
    public ResponseEntity<?> submit(@PathVariable String id) {
        AuthorizationRequest reqObj = findRequest(id);
        if (reqObj == null) return notFound();

        if (reqObj.getAiReview() == null || !reqObj.getAiReview().isValid()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Request must pass AI Copilot validation before submission."));
        }

        String now = Instant.now().toString();
        reqObj.setStatus("Pending");
        reqObj.setUpdatedAt(now);
        reqObj.getHistory().add(new HistoryEntry("Pending", "Submitted to payer.", now));

        pushNotification(reqObj.getPayerUsername(),
                String.format("New authorization request for %s is pending review.", reqObj.getPatientName()),
                reqObj.getId());

        dataStore.save();
        return ResponseEntity.ok(reqObj);
    }

    // ---------- List (filtered by role/user) ----------
    @GetMapping
    public ResponseEntity<?> listRequests(@RequestParam(required = false) String username,
                                           @RequestParam(required = false) String role) {
        List<AuthorizationRequest> all = dataStore.getDatabase().getRequests();
        List<AuthorizationRequest> results;

        if ("provider".equals(role)) {
            results = all.stream()
                    .filter(r -> username != null && username.equals(r.getProviderUsername()))
                    .collect(Collectors.toList());
        } else if ("payer".equals(role)) {
            results = all.stream()
                    .filter(r -> username != null && username.equals(r.getPayerUsername()) && !"Draft".equals(r.getStatus()))
                    .collect(Collectors.toList());
        } else {
            results = all;
        }

        results.sort(Comparator.comparing(AuthorizationRequest::getUpdatedAt).reversed());
        return ResponseEntity.ok(results);
    }

    // ---------- Payer decision (Accept/Reject) ----------
    @PostMapping("/{id}/decision")
    public ResponseEntity<?> decide(@PathVariable String id, @RequestBody DecisionRequest decisionRequest) {
        String decision = decisionRequest.getDecision();
        if (!"Accepted".equals(decision) && !"Rejected".equals(decision)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Decision must be 'Accepted' or 'Rejected'."));
        }

        AuthorizationRequest reqObj = findRequest(id);
        if (reqObj == null) return notFound();

        String now = Instant.now().toString();
        String reason = decisionRequest.getReason();

        reqObj.setStatus(decision);
        reqObj.setUpdatedAt(now);
        reqObj.getHistory().add(new HistoryEntry(decision, reason == null ? "" : reason, now));

        String message = String.format("Your request for %s was %s.%s",
                reqObj.getPatientName(),
                decision.toLowerCase(),
                (reason != null && !reason.isBlank()) ? " Reason: " + reason : "");

        pushNotification(reqObj.getProviderUsername(), message, reqObj.getId());

        dataStore.save();
        return ResponseEntity.ok(reqObj);
    }

    // ---------- helpers ----------
    private AuthorizationRequest findRequest(String id) {
        return dataStore.getDatabase().getRequests().stream()
                .filter(r -> r.getId().equals(id))
                .findFirst()
                .orElse(null);
    }

    private ResponseEntity<?> notFound() {
        return ResponseEntity.status(404).body(Map.of("error", "Request not found."));
    }

    private void pushNotification(String username, String message, String requestId) {
        Notification note = new Notification(
                UUID.randomUUID().toString(),
                username,
                message,
                requestId,
                false,
                Instant.now().toString()
        );
        dataStore.getDatabase().getNotifications().add(note);
    }
}
