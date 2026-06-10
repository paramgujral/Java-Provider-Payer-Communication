package com.healthconnect.platform.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.healthconnect.platform.dto.response.AiAnalysisResponse;
import com.healthconnect.platform.dto.response.AiAnalysisResponse.AiIssue;
import com.healthconnect.platform.entity.AuthorizationRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AiCopilotService {

    private final ObjectMapper objectMapper;

    private static final Pattern CPT_PATTERN =
            Pattern.compile("^\\d{5}$");
    private static final Pattern ICD10_PATTERN =
            Pattern.compile("^[A-TV-Z][0-9][0-9AB](\\.[0-9A-Z]{1,4})?$", Pattern.CASE_INSENSITIVE);
    private static final Pattern CONSERVATIVE_PATTERN =
            Pattern.compile("(physical therapy|conservative|nsaid|medication|tried|failed|attempted)",
                    Pattern.CASE_INSENSITIVE);

    public AiAnalysisResponse analyze(AuthorizationRequest request) {
        List<AiIssue> issues = buildIssues(request);

        long errors   = issues.stream().filter(i -> "ERROR".equals(i.getSeverity())).count();
        long warnings = issues.stream().filter(i -> "WARNING".equals(i.getSeverity())).count();
        long infos    = issues.stream().filter(i -> "INFO".equals(i.getSeverity())).count();

        int completenessScore   = (int) Math.max(0, Math.min(100, 100 - errors * 20 - warnings * 8 - infos * 3));
        int approvalProbability = calculateApproval(completenessScore, errors, request);
        String riskLevel        = determineRiskLevel(approvalProbability);
        String summary          = buildSummary(request, completenessScore, approvalProbability, errors, warnings);
        String suggestedNarrative = buildNarrative(request);

        // Backwards-compat flat lists derived from issues
        List<String> missingFields    = issues.stream().filter(i -> "ERROR".equals(i.getSeverity())).map(AiIssue::getTitle).collect(Collectors.toList());
        List<String> warningMessages  = issues.stream().filter(i -> "WARNING".equals(i.getSeverity())).map(AiIssue::getTitle).collect(Collectors.toList());
        List<String> recommendations  = buildRecommendations(issues, request);

        return AiAnalysisResponse.builder()
                .completenessScore(completenessScore)
                .approvalProbability(approvalProbability)
                .riskLevel(riskLevel)
                .issues(issues)
                .recommendations(recommendations)
                .missingFields(missingFields)
                .warnings(warningMessages)
                .summary(summary)
                .suggestedNarrative(isBlank(request.getClinicalNotes()) ? suggestedNarrative : null)
                .build();
    }

    private List<AiIssue> buildIssues(AuthorizationRequest req) {
        List<AiIssue> issues = new ArrayList<>();

        // ── ERROR level ────────────────────────────────────────────────────
        if (isBlank(req.getClinicalNotes())) {
            issues.add(AiIssue.builder()
                    .severity("ERROR").field("clinicalNotes")
                    .title("Clinical justification is empty")
                    .detail("A medical-necessity narrative is the single biggest driver of payer approval.")
                    .suggestion("Describe symptoms, duration, prior treatments tried, and expected clinical benefit.")
                    .build());
        }

        if (isBlank(req.getDiagnosisCode())) {
            issues.add(AiIssue.builder()
                    .severity("ERROR").field("diagnosisCode")
                    .title("No ICD-10 diagnosis code provided")
                    .detail("A supporting diagnosis is mandatory to establish medical necessity.")
                    .suggestion("Add the ICD-10 code describing the condition (e.g. M54.5 for low back pain).")
                    .build());
        } else if (!ICD10_PATTERN.matcher(req.getDiagnosisCode().trim()).matches()) {
            issues.add(AiIssue.builder()
                    .severity("ERROR").field("diagnosisCode")
                    .title("ICD-10 code format is invalid: " + req.getDiagnosisCode())
                    .detail("ICD-10-CM codes start with a letter followed by digits (e.g. M54.5). Malformed codes cause auto-rejection.")
                    .suggestion("Verify the diagnosis code against the current ICD-10-CM code set.")
                    .build());
        }

        if (isBlank(req.getProcedureCode())) {
            issues.add(AiIssue.builder()
                    .severity("ERROR").field("procedureCode")
                    .title("No CPT procedure code provided")
                    .detail("At least one CPT code is required for medical-necessity review.")
                    .suggestion("Add the CPT code matching the requested procedure (e.g. 97110 for therapeutic exercises).")
                    .build());
        } else if (!CPT_PATTERN.matcher(req.getProcedureCode().trim()).matches()) {
            issues.add(AiIssue.builder()
                    .severity("ERROR").field("procedureCode")
                    .title("CPT code format looks invalid: " + req.getProcedureCode())
                    .detail("CPT codes are exactly 5 numeric digits. Malformed codes are a top cause of automatic rejection.")
                    .suggestion("Re-check against the current CPT code set.")
                    .build());
        }

        // ── WARNING level ──────────────────────────────────────────────────
        if (isBlank(req.getSupportingDocuments())) {
            issues.add(AiIssue.builder()
                    .severity("WARNING").field("supportingDocuments")
                    .title("No supporting documents attached")
                    .detail("Clinical notes, imaging reports, or lab results substantially increase first-pass approval.")
                    .suggestion("Attach the relevant clinical notes, labs, or imaging reports.")
                    .build());
        }

        if (isBlank(req.getFacilityName())) {
            issues.add(AiIssue.builder()
                    .severity("WARNING").field("facilityName")
                    .title("Facility name not specified")
                    .detail("Payers require a facility name for in-network verification.")
                    .suggestion("Specify the facility where the procedure will be performed.")
                    .build());
        }

        if (isBlank(req.getTreatingPhysician())) {
            issues.add(AiIssue.builder()
                    .severity("WARNING").field("treatingPhysician")
                    .title("Treating physician not specified")
                    .detail("Physician credentials are required to verify provider network status.")
                    .suggestion("Include the treating physician's full name and specialty.")
                    .build());
        }

        if (req.getClinicalNotes() != null && !req.getClinicalNotes().isBlank()
                && req.getClinicalNotes().length() < 120) {
            issues.add(AiIssue.builder()
                    .severity("WARNING").field("clinicalNotes")
                    .title("Clinical justification is too brief")
                    .detail("Short narratives are frequently returned with a request for additional information.")
                    .suggestion("Include conservative therapies tried, their outcomes, and expected benefit of the requested service.")
                    .build());
        }

        if (req.getRequestedServiceDate() != null && req.getRequestedServiceEndDate() != null
                && req.getRequestedServiceDate().isAfter(req.getRequestedServiceEndDate())) {
            issues.add(AiIssue.builder()
                    .severity("WARNING").field("dates")
                    .title("Service start date is after end date")
                    .detail("Date range conflict will cause automatic rejection by most payer systems.")
                    .suggestion("Correct the service date range so start is before end.")
                    .build());
        }

        // ── INFO level ─────────────────────────────────────────────────────
        String notes = req.getClinicalNotes() != null ? req.getClinicalNotes() : "";
        boolean mentionsConservative = CONSERVATIVE_PATTERN.matcher(notes).find();
        if (!notes.isBlank() && !mentionsConservative) {
            issues.add(AiIssue.builder()
                    .severity("INFO").field("clinicalNotes")
                    .title("No mention of conservative treatment")
                    .detail("Most payer policies require documentation that conservative care was attempted first before authorizing this type of service.")
                    .suggestion("State which conservative treatments were tried (e.g. NSAIDs, physical therapy) and for how long.")
                    .build());
        }

        if (isBlank(req.getPatientInsurancePlan())) {
            issues.add(AiIssue.builder()
                    .severity("INFO").field("patientInsurancePlan")
                    .title("Insurance plan not specified")
                    .detail("Specifying the insurance plan helps payers route the request to the correct policy reviewer.")
                    .suggestion("Add the patient's insurance plan name and tier (e.g. BlueCross PPO Gold).")
                    .build());
        }

        if ("URGENT".equals(req.getPriority()) && isBlank(req.getClinicalNotes())) {
            issues.add(AiIssue.builder()
                    .severity("WARNING").field("priority")
                    .title("Urgent priority set but no clinical justification provided")
                    .detail("Urgent requests without a clinical narrative receive extra scrutiny and may be downgraded to routine.")
                    .suggestion("Add clinical notes explaining why this request requires urgent handling.")
                    .build());
        }

        return issues;
    }

    private int calculateApproval(int completeness, long errors, AuthorizationRequest req) {
        double score = completeness * 0.65;
        score -= errors * 10;

        String notes = req.getClinicalNotes() != null ? req.getClinicalNotes() : "";
        if (CONSERVATIVE_PATTERN.matcher(notes).find()) score += 8;
        if (notes.length() > 200) score += 8;
        if (req.getSupportingDocuments() != null && !req.getSupportingDocuments().isBlank()) score += 6;
        if ("Outpatient".equalsIgnoreCase(req.getServiceType())) score += 5;
        if ("URGENT".equals(req.getPriority()) && notes.isBlank()) score -= 12;

        return Math.max(0, Math.min(100, (int) score));
    }

    private String determineRiskLevel(int approvalProbability) {
        if (approvalProbability >= 70) return "LOW";
        if (approvalProbability >= 40) return "MEDIUM";
        return "HIGH";
    }

    private String buildSummary(AuthorizationRequest req, int completeness, int approval, long errors, long warnings) {
        String svc = isBlank(req.getProcedureDescription()) ? "the requested service" : req.getProcedureDescription();
        if (errors > 0)
            return "This request for " + svc + " is NOT ready to submit — " + errors +
                   " blocking issue(s) must be resolved. Estimated approval likelihood: " + approval + "%.";
        if (warnings > 0)
            return "This request for " + svc + " is submittable but can be strengthened. " +
                   "Addressing " + warnings + " warning(s) would improve the " + approval + "% approval likelihood.";
        return "This request for " + svc + " looks complete. Estimated approval likelihood: " + approval + "%.";
    }

    private String buildNarrative(AuthorizationRequest req) {
        String svc = isBlank(req.getProcedureDescription()) ? "[procedure]" : req.getProcedureDescription();
        String dx  = isBlank(req.getDiagnosisCode()) ? "[diagnosis]" : req.getDiagnosisCode() +
                     (isBlank(req.getDiagnosisDescription()) ? "" : " (" + req.getDiagnosisDescription() + ")");
        return "Patient presents with " + dx + ". Conservative management (e.g. NSAIDs and physical therapy) " +
               "has been attempted for [duration] without adequate improvement. " + svc + " is requested to " +
               "[clarify diagnosis / guide treatment]. Expected clinical benefit: [describe]. " +
               "Supporting documentation is attached.";
    }

    private List<String> buildRecommendations(List<AiIssue> issues, AuthorizationRequest req) {
        List<String> recs = new ArrayList<>();
        for (AiIssue issue : issues) {
            if (issue.getSuggestion() != null) recs.add(issue.getSuggestion());
        }
        // Domain-specific extras
        if (req.getDiagnosisCode() != null &&
                (req.getDiagnosisCode().startsWith("C") || req.getDiagnosisCode().startsWith("D4"))) {
            recs.add("Oncology diagnosis detected — attach pathology reports for faster approval.");
        }
        if ("Inpatient".equalsIgnoreCase(req.getServiceType())) {
            recs.add("For inpatient requests, include estimated length of stay and a discharge plan.");
        }
        return recs;
    }

    public String serializeRecommendations(List<String> recommendations) {
        try {
            return objectMapper.writeValueAsString(recommendations);
        } catch (JsonProcessingException e) { return "[]"; }
    }

    @SuppressWarnings("unchecked")
    public List<String> deserializeRecommendations(String json) {
        if (json == null || json.isBlank()) return new ArrayList<>();
        try {
            return objectMapper.readValue(json, List.class);
        } catch (JsonProcessingException e) { return new ArrayList<>(); }
    }

    private boolean isBlank(String s) { return s == null || s.isBlank(); }
}
