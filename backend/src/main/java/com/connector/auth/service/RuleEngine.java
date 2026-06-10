package com.connector.auth.service;

import com.connector.auth.domain.*;
import org.springframework.stereotype.Component;

import java.util.Set;

/**
 * Deterministic clinical-completeness engine. Acts as the AI Copilot's
 * always-available fallback (and a sanity baseline even when an LLM is used).
 * Encodes common medical-necessity / completeness checks used in
 * prior-authorization review.
 */
@Component
public class RuleEngine {

    // CPT codes that payers commonly subject to medical-necessity review for advanced imaging
    private static final Set<String> ADVANCED_IMAGING = Set.of(
            "70551", "70552", "70553",   // MRI brain
            "72148", "72149", "72158",   // MRI lumbar
            "70450", "70460", "70470",   // CT head
            "72125", "72126", "72127"    // CT spine
    );

    public CopilotReview review(AuthorizationRequest r) {
        CopilotReview review = new CopilotReview();
        review.setSource("RULES");

        int score = 100;

        // --- diagnosis ---
        if (r.getDiagnoses() == null || r.getDiagnoses().isEmpty()) {
            score -= 30;
            review.addIssue(issue(Severity.ERROR, "diagnosis",
                    "No diagnosis (ICD-10) codes provided.",
                    "Add at least one specific ICD-10-CM diagnosis that justifies the requested service.", false));
        } else {
            boolean hasPrincipal = r.getDiagnoses().stream().anyMatch(d -> Boolean.TRUE.equals(d.getIsPrincipal()));
            if (!hasPrincipal) {
                score -= 5;
                review.addIssue(issue(Severity.INFO, "diagnosis",
                        "No principal diagnosis flagged.",
                        "Mark the primary diagnosis driving medical necessity as principal.", true));
            }
            boolean vague = r.getDiagnoses().stream().anyMatch(d ->
                    d.getIcd10Code() != null && (d.getIcd10Code().endsWith(".9") || d.getIcd10Code().equalsIgnoreCase("R51.9")));
            if (vague) {
                score -= 12;
                review.addIssue(issue(Severity.WARNING, "diagnosis",
                        "Non-specific / unspecified diagnosis used.",
                        "Replace unspecified codes with a more specific diagnosis to support medical necessity.", false));
            }
        }

        // --- service lines ---
        if (r.getServiceLines() == null || r.getServiceLines().isEmpty()) {
            score -= 30;
            review.addIssue(issue(Severity.ERROR, "serviceLines",
                    "No procedure / service (CPT) requested.",
                    "Add at least one CPT/HCPCS code describing the requested service.", false));
        } else {
            for (ServiceLine line : r.getServiceLines()) {
                if (line.getUnits() == null || line.getUnits() < 1) {
                    score -= 8;
                    review.addIssue(issue(Severity.WARNING, "serviceLines",
                            "Service " + line.getCptCode() + " has no valid unit count.",
                            "Specify the number of units / sessions requested.", true));
                }
            }
        }

        // --- place of service ---
        if (isBlank(r.getPlaceOfService())) {
            score -= 6;
            review.addIssue(issue(Severity.WARNING, "placeOfService",
                    "Place of service not specified.",
                    "Indicate where the service will be performed (e.g., Outpatient Hospital).", true));
        }

        // --- scheduled date ---
        if (isBlank(r.getServiceStart())) {
            score -= 5;
            review.addIssue(issue(Severity.INFO, "serviceStart",
                    "No planned service date provided.",
                    "Add an anticipated date of service.", true));
        }

        // --- clinical narrative ---
        String notes = r.getClinicalNotes() == null ? "" : r.getClinicalNotes().trim();
        if (notes.length() < 40) {
            score -= 20;
            review.addIssue(issue(Severity.ERROR, "clinicalNotes",
                    "Clinical narrative is insufficient to establish medical necessity.",
                    "Document onset/duration, exam findings, prior workup, and failed conservative treatment.", false));
        }

        // --- procedure-specific medical-necessity rules ---
        boolean requestsAdvancedImaging = r.getServiceLines() != null && r.getServiceLines().stream()
                .anyMatch(l -> l.getCptCode() != null && ADVANCED_IMAGING.contains(l.getCptCode()));
        if (requestsAdvancedImaging) {
            String lower = notes.toLowerCase();
            boolean mentionsConservative = lower.contains("physical therapy") || lower.contains("conservative")
                    || lower.contains("nsaid") || lower.contains("pt ") || lower.contains("weeks");
            if (!mentionsConservative) {
                score -= 15;
                review.addIssue(issue(Severity.WARNING, "clinicalNotes",
                        "Advanced imaging requested without documented conservative therapy.",
                        "Most payers require documented failed conservative treatment (e.g., 6 weeks of PT/NSAIDs) for advanced imaging.", false));
            }
        }

        score = Math.max(0, Math.min(100, score));
        review.setReadinessScore(score);
        review.setDecision(score >= 80 ? "READY" : "NEEDS_FIXES");
        review.setPredictedOutcome(score >= 85 ? "LIKELY_APPROVE" : (score >= 60 ? "UNCERTAIN" : "LIKELY_DENY"));
        review.setMedicalNecessity(buildNecessity(score, requestsAdvancedImaging, notes));
        review.setSummary(buildSummary(score, review));
        return review;
    }

    private String buildNecessity(int score, boolean imaging, String notes) {
        if (score >= 85)
            return "Documentation supports medical necessity for the requested service.";
        if (score >= 60)
            return "Medical necessity is partially supported; strengthen the clinical narrative to reduce denial risk.";
        return "Medical necessity is NOT established by the current documentation"
                + (imaging ? ", and advanced-imaging criteria appear unmet." : ".");
    }

    private String buildSummary(int score, CopilotReview review) {
        long errors = review.getIssues().stream().filter(i -> i.getSeverity() == Severity.ERROR).count();
        long warnings = review.getIssues().stream().filter(i -> i.getSeverity() == Severity.WARNING).count();
        if (score >= 80 && errors == 0)
            return "Request looks complete and well supported. Safe to submit.";
        return String.format("Found %d blocking issue(s) and %d warning(s). Resolve these before submitting to reduce back-and-forth.",
                errors, warnings);
    }

    private CopilotIssue issue(Severity sev, String field, String problem, String rec, boolean autoFix) {
        CopilotIssue i = new CopilotIssue();
        i.setSeverity(sev);
        i.setField(field);
        i.setProblem(problem);
        i.setRecommendation(rec);
        i.setAutoFixable(autoFix);
        return i;
    }

    private boolean isBlank(String s) { return s == null || s.isBlank(); }
}
