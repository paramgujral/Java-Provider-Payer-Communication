package com.healthcare.connector.service;

import com.healthcare.connector.ai.ClinicalValidator;
import com.healthcare.connector.dto.AiAnalysisResult;
import com.healthcare.connector.dto.AuthorizationRequest;
import com.healthcare.connector.model.AuthorizationCase;
import com.healthcare.connector.model.Notification;
import com.healthcare.connector.model.User;
import com.healthcare.connector.repository.AuthorizationCaseRepository;
import com.healthcare.connector.repository.NotificationRepository;
import com.healthcare.connector.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class AuthorizationService {

    @Autowired
    private AuthorizationCaseRepository caseRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private ClinicalValidator clinicalValidator;

    // ── Create Draft ──────────────────────────────────────────────────────────

    @Transactional
    public AuthorizationCase createDraft(AuthorizationRequest req, String providerUsername) {
        User provider = findUser(providerUsername);

        AuthorizationCase aCase = new AuthorizationCase();
        aCase.setCaseId(generateCaseId());
        mapRequestToCase(req, aCase);
        aCase.setProvider(provider);
        aCase.setStatus(AuthorizationCase.CaseStatus.DRAFT);

        // Run AI analysis on create
        AiAnalysisResult aiResult = clinicalValidator.analyze(req);
        aCase.setAiRiskScore(aiResult.getRiskScore());
        aCase.setAiRiskLevel(aiResult.getRiskLevel());
        aCase.setAiAnalysis(aiResult.getAnalysisSummary());

        return caseRepository.save(aCase);
    }

    // ── Analyze (dry run) ─────────────────────────────────────────────────────

    public AiAnalysisResult analyze(AuthorizationRequest req) {
        return clinicalValidator.analyze(req);
    }

    // ── Submit ────────────────────────────────────────────────────────────────

    @Transactional
    public AuthorizationCase submit(String caseId, String providerUsername) {
        AuthorizationCase aCase = findCase(caseId);
        assertOwner(aCase, providerUsername);

        // Re-run AI scan on submit
        AuthorizationRequest req = mapCaseToRequest(aCase);
        AiAnalysisResult aiResult = clinicalValidator.analyze(req);
        aCase.setAiRiskScore(aiResult.getRiskScore());
        aCase.setAiRiskLevel(aiResult.getRiskLevel());
        aCase.setAiAnalysis(aiResult.getAnalysisSummary());

        aCase.setStatus(AuthorizationCase.CaseStatus.TRANSMITTED);
        aCase.setSubmittedAt(LocalDateTime.now());
        AuthorizationCase saved = caseRepository.save(aCase);

        // Notify all payers
        notifyPayers("New Authorization Request: " + caseId,
                "Provider " + providerUsername + " submitted case " + caseId + ". AI Risk: " + aiResult.getRiskLevel(),
                Notification.NotificationType.AI_INSIGHT, caseId);

        return saved;
    }

    // ── AI Fix ────────────────────────────────────────────────────────────────

    @Transactional
    public AiAnalysisResult applyAiFix(String caseId, String username) {
        AuthorizationCase aCase = findCase(caseId);
        AuthorizationRequest req = mapCaseToRequest(aCase);
        AiAnalysisResult result = clinicalValidator.analyze(req);

        aCase.setAiRiskScore(result.getRiskScore());
        aCase.setAiRiskLevel(result.getRiskLevel());
        aCase.setAiAnalysis(result.getAnalysisSummary());
        caseRepository.save(aCase);

        return result;
    }

    // ── Payer Review ──────────────────────────────────────────────────────────

    @Transactional
    public AuthorizationCase review(String caseId, String decision, String payerNotes,
                                    String clarification, String payerUsername) {
        AuthorizationCase aCase = findCase(caseId);
        User payer = findUser(payerUsername);

        aCase.setAssignedPayer(payer);
        aCase.setPayerDecision(decision);
        aCase.setPayerNotes(payerNotes);
        aCase.setReviewedAt(LocalDateTime.now());

        switch (decision.toUpperCase()) {
            case "APPROVED" -> {
                aCase.setStatus(AuthorizationCase.CaseStatus.FINALIZED);
                aCase.setFinalizedAt(LocalDateTime.now());
                notifyUser(aCase.getProvider(), "Authorization Approved",
                        "Your request " + caseId + " has been approved.", Notification.NotificationType.SUCCESS, caseId);
            }
            case "DENIED" -> {
                aCase.setStatus(AuthorizationCase.CaseStatus.FINALIZED);
                aCase.setFinalizedAt(LocalDateTime.now());
                notifyUser(aCase.getProvider(), "Authorization Denied",
                        "Your request " + caseId + " was denied. " + payerNotes, Notification.NotificationType.CRITICAL, caseId);
            }
            case "INFO_REQUESTED" -> {
                aCase.setStatus(AuthorizationCase.CaseStatus.INFO_REQUESTED);
                aCase.setClarificationRequested(clarification);
                notifyUser(aCase.getProvider(), "Additional Info Required",
                        "Payer requests more info for " + caseId + ": " + clarification, Notification.NotificationType.WARNING, caseId);
            }
            default -> throw new IllegalArgumentException("Invalid decision: " + decision);
        }

        return caseRepository.save(aCase);
    }

    // ── Clarification Response ────────────────────────────────────────────────

    @Transactional
    public AuthorizationCase submitClarification(String caseId, String notes, String providerUsername) {
        AuthorizationCase aCase = findCase(caseId);
        assertOwner(aCase, providerUsername);
        aCase.setPayerNotes(notes);
        aCase.setStatus(AuthorizationCase.CaseStatus.PAYER_REVIEW);
        return caseRepository.save(aCase);
    }

    // ── Dashboards ────────────────────────────────────────────────────────────

    public Map<String, Object> providerDashboard(String username) {
        User provider = findUser(username);
        List<AuthorizationCase> cases = caseRepository.findByProviderOrderByCreatedAtDesc(provider);

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalCases", cases.size());
        stats.put("draftCases", cases.stream().filter(c -> c.getStatus() == AuthorizationCase.CaseStatus.DRAFT).count());
        stats.put("transmittedCases", cases.stream().filter(c -> c.getStatus() == AuthorizationCase.CaseStatus.TRANSMITTED).count());
        stats.put("pendingReview", cases.stream().filter(c -> c.getStatus() == AuthorizationCase.CaseStatus.PAYER_REVIEW).count());
        stats.put("infoRequested", cases.stream().filter(c -> c.getStatus() == AuthorizationCase.CaseStatus.INFO_REQUESTED).count());
        stats.put("finalized", cases.stream().filter(c -> c.getStatus() == AuthorizationCase.CaseStatus.FINALIZED).count());
        stats.put("avgRiskScore", cases.stream().filter(c -> c.getAiRiskScore() != null)
                .mapToInt(AuthorizationCase::getAiRiskScore).average().orElse(0.0));
        stats.put("recentCases", cases.stream().limit(5).map(this::mapCaseToSummary).toList());
        return stats;
    }

    public Map<String, Object> payerDashboard() {
        List<AuthorizationCase> all = caseRepository.findAllSubmittedCases();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalSubmitted", all.size());
        stats.put("pendingReview", all.stream().filter(c -> c.getStatus() == AuthorizationCase.CaseStatus.TRANSMITTED
                || c.getStatus() == AuthorizationCase.CaseStatus.PAYER_REVIEW).count());
        stats.put("infoRequested", all.stream().filter(c -> c.getStatus() == AuthorizationCase.CaseStatus.INFO_REQUESTED).count());
        stats.put("finalized", all.stream().filter(c -> c.getStatus() == AuthorizationCase.CaseStatus.FINALIZED).count());
        stats.put("highRisk", all.stream().filter(c -> "RED".equals(c.getAiRiskLevel())).count());
        stats.put("mediumRisk", all.stream().filter(c -> "YELLOW".equals(c.getAiRiskLevel())).count());
        stats.put("lowRisk", all.stream().filter(c -> "GREEN".equals(c.getAiRiskLevel())).count());
        stats.put("recentCases", all.stream().limit(10).map(this::mapCaseToSummary).toList());
        return stats;
    }

    // ── Kanban ────────────────────────────────────────────────────────────────

    public Map<String, List<Map<String, Object>>> getKanban() {
        Map<String, List<Map<String, Object>>> board = new LinkedHashMap<>();
        for (AuthorizationCase.CaseStatus status : AuthorizationCase.CaseStatus.values()) {
            List<AuthorizationCase> cases = caseRepository.findByStatus(status);
            board.put(status.name(), cases.stream().map(this::mapCaseToSummary).toList());
        }
        return board;
    }

    // ── Get Case ──────────────────────────────────────────────────────────────

    public AuthorizationCase getCase(String caseId) {
        return findCase(caseId);
    }

    public List<AuthorizationCase> getProviderCases(String username) {
        User provider = findUser(username);
        return caseRepository.findByProviderOrderByCreatedAtDesc(provider);
    }

    public List<AuthorizationCase> getPayerCases() {
        return caseRepository.findAllSubmittedCases();
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private String generateCaseId() {
        return "HC-" + String.format("%06d", new Random().nextInt(999999));
    }

    private void mapRequestToCase(AuthorizationRequest req, AuthorizationCase c) {
        c.setPatientName(req.getPatientName());
        c.setPatientDob(req.getPatientDob());
        c.setPatientGender(req.getPatientGender());
        c.setPatientMemberId(req.getPatientMemberId());
        c.setNpiNumber(req.getNpiNumber());
        c.setProviderName(req.getProviderName());
        c.setIcd10Code(req.getIcd10Code());
        c.setDiagnosisDescription(req.getDiagnosisDescription());
        c.setCptCode(req.getCptCode());
        c.setProcedureDescription(req.getProcedureDescription());
        c.setClinicalNotes(req.getClinicalNotes());
        c.setInsuranceId(req.getInsuranceId());
        c.setInsurancePlan(req.getInsurancePlan());
        c.setUrgencyLevel(req.getUrgencyLevel());
    }

    private AuthorizationRequest mapCaseToRequest(AuthorizationCase c) {
        AuthorizationRequest req = new AuthorizationRequest();
        req.setPatientName(c.getPatientName());
        req.setPatientDob(c.getPatientDob());
        req.setPatientGender(c.getPatientGender());
        req.setPatientMemberId(c.getPatientMemberId());
        req.setNpiNumber(c.getNpiNumber());
        req.setProviderName(c.getProviderName());
        req.setIcd10Code(c.getIcd10Code());
        req.setDiagnosisDescription(c.getDiagnosisDescription());
        req.setCptCode(c.getCptCode());
        req.setProcedureDescription(c.getProcedureDescription());
        req.setClinicalNotes(c.getClinicalNotes());
        req.setInsuranceId(c.getInsuranceId());
        req.setInsurancePlan(c.getInsurancePlan());
        req.setUrgencyLevel(c.getUrgencyLevel());
        return req;
    }

    private Map<String, Object> mapCaseToSummary(AuthorizationCase c) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("caseId", c.getCaseId());
        map.put("patientName", c.getPatientName());
        map.put("icd10Code", c.getIcd10Code());
        map.put("cptCode", c.getCptCode());
        map.put("status", c.getStatus().name());
        map.put("aiRiskScore", c.getAiRiskScore());
        map.put("aiRiskLevel", c.getAiRiskLevel());
        map.put("urgencyLevel", c.getUrgencyLevel());
        map.put("providerName", c.getProvider().getFullName());
        map.put("updatedAt", c.getUpdatedAt() != null ? c.getUpdatedAt().toString() : null);
        return map;
    }

    private AuthorizationCase findCase(String caseId) {
        return caseRepository.findByCaseId(caseId)
                .orElseThrow(() -> new RuntimeException("Case not found: " + caseId));
    }

    private User findUser(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
    }

    private void assertOwner(AuthorizationCase aCase, String username) {
        if (!aCase.getProvider().getUsername().equals(username)) {
            throw new RuntimeException("Access denied: not the case owner.");
        }
    }

    private void notifyUser(User user, String title, String message,
                            Notification.NotificationType type, String caseId) {
        Notification n = new Notification();
        n.setUser(user);
        n.setTitle(title);
        n.setMessage(message);
        n.setType(type);
        n.setRelatedCaseId(caseId);
        notificationRepository.save(n);
    }

    private void notifyPayers(String title, String message,
                              Notification.NotificationType type, String caseId) {
        userRepository.findAll().stream()
                .filter(u -> u.getRole() == User.UserRole.PAYER)
                .forEach(payer -> notifyUser(payer, title, message, type, caseId));
    }
}
