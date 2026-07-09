package com.healthconnect.service;

import com.healthconnect.dto.AuthorizationDtos.CopilotReviewResponse;
import com.healthconnect.model.AuthorizationRequest;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

/**
 * Rule-based "AI Copilot" that reviews a Prior Authorization request before
 * submission, checking for completeness, common coding errors, and
 * payer-readiness, then recommends corrections.
 *
 * This simulates an AI reviewer using deterministic domain rules so the
 * platform works without any external AI API dependency.
 */
@Service
public class AiCopilotService {

    // CPT codes are 5 digits. HCPCS Level II codes start with a letter + 4 digits.
    private static final Pattern CPT_PATTERN = Pattern.compile("^\\d{5}$");
    private static final Pattern HCPCS_PATTERN = Pattern.compile("^[A-Z]\\d{4}$");

    // ICD-10 format: letter, 2 digits, optional decimal + up to 4 alphanumeric
    private static final Pattern ICD10_PATTERN = Pattern.compile("^[A-TV-Z][0-9][0-9A-Z](\\.[0-9A-Z]{1,4})?$");

    // NPI is exactly 10 digits
    private static final Pattern NPI_PATTERN = Pattern.compile("^\\d{10}$");

    /**
     * Runs a full review of the given request and returns a score,
     * flagged issues, and actionable recommendations.
     */
    public CopilotReviewResponse review(AuthorizationRequest req) {
        List<String> issues = new ArrayList<>();
        List<String> recommendations = new ArrayList<>();

        int score = 100;

        // --- 1. Procedure code format check ---
        String proc = req.getProcedureCode() == null ? "" : req.getProcedureCode().trim().toUpperCase();
        if (proc.isEmpty()) {
            issues.add("Procedure code is missing.");
            recommendations.add("Add a valid CPT or HCPCS procedure code.");
            score -= 20;
        } else if (!CPT_PATTERN.matcher(proc).matches() && !HCPCS_PATTERN.matcher(proc).matches()) {
            issues.add("Procedure code '" + req.getProcedureCode() + "' does not match standard CPT (5 digits) or HCPCS (letter + 4 digits) format.");
            recommendations.add("Verify the procedure code against the current CPT/HCPCS code set.");
            score -= 15;
        }

        // --- 2. Diagnosis code format check (ICD-10) ---
        String diag = req.getDiagnosisCode() == null ? "" : req.getDiagnosisCode().trim().toUpperCase();
        if (diag.isEmpty()) {
            issues.add("Diagnosis code is missing.");
            recommendations.add("Add a valid ICD-10 diagnosis code.");
            score -= 20;
        } else if (!ICD10_PATTERN.matcher(diag).matches()) {
            issues.add("Diagnosis code '" + req.getDiagnosisCode() + "' does not match ICD-10 format (e.g. M54.5).");
            recommendations.add("Confirm the ICD-10 code, including the decimal subcategory if applicable.");
            score -= 15;
        }

        // --- 3. NPI validation ---
        String npi = req.getProviderNpi() == null ? "" : req.getProviderNpi().trim();
        if (npi.isEmpty()) {
            issues.add("Provider NPI is missing.");
            recommendations.add("Add the rendering provider's 10-digit National Provider Identifier (NPI).");
            score -= 10;
        } else if (!NPI_PATTERN.matcher(npi).matches()) {
            issues.add("Provider NPI '" + npi + "' must be exactly 10 digits.");
            recommendations.add("Re-enter the NPI; it must be a 10-digit number.");
            score -= 10;
        }

        // --- 4. Member ID presence ---
        if (isBlank(req.getPatientMemberId())) {
            issues.add("Patient insurance member ID is missing.");
            recommendations.add("Add the patient's payer member ID from their insurance card.");
            score -= 10;
        }

        // --- 5. Clinical notes / medical necessity ---
        String notes = req.getClinicalNotes();
        if (isBlank(notes)) {
            issues.add("No clinical notes provided to support medical necessity.");
            recommendations.add("Attach clinical notes summarizing symptoms, prior treatments, and medical necessity rationale.");
            score -= 15;
        } else if (notes.trim().length() < 30) {
            issues.add("Clinical notes are very brief and may not establish medical necessity.");
            recommendations.add("Expand clinical notes to describe diagnosis history, prior treatments tried, and why this service is needed now.");
            score -= 8;
        }

        // --- 6. Requested service date validity ---
        String serviceDate = req.getRequestedServiceDate();
        if (isBlank(serviceDate)) {
            issues.add("Requested service date is missing.");
            recommendations.add("Specify the date the service is requested to be performed.");
            score -= 5;
        } else {
            try {
                LocalDate date = LocalDate.parse(serviceDate.trim(), DateTimeFormatter.ISO_DATE);
                if (date.isBefore(LocalDate.now())) {
                    issues.add("Requested service date (" + serviceDate + ") is in the past.");
                    recommendations.add("Update the requested service date to a current or future date, or note this is a retroactive authorization.");
                    score -= 5;
                }
            } catch (Exception e) {
                issues.add("Requested service date '" + serviceDate + "' is not a valid date (expected YYYY-MM-DD).");
                recommendations.add("Enter the service date in YYYY-MM-DD format.");
                score -= 5;
            }
        }

        // --- 7. Units requested ---
        if (req.getUnitsRequested() == null || req.getUnitsRequested() <= 0) {
            issues.add("Units/quantity requested is missing or invalid.");
            recommendations.add("Specify the number of units, visits, or days being requested.");
            score -= 5;
        } else if (req.getUnitsRequested() > 99) {
            issues.add("Units requested (" + req.getUnitsRequested() + ") is unusually high and may trigger additional payer scrutiny.");
            recommendations.add("Double-check the units requested; consider splitting into multiple authorization periods if appropriate.");
            score -= 3;
        }

        // --- 8. Patient DOB sanity check ---
        if (isBlank(req.getPatientDob())) {
            issues.add("Patient date of birth is missing.");
            recommendations.add("Add the patient's date of birth to confirm member eligibility.");
            score -= 5;
        }

        // Clamp score
        if (score < 0) score = 0;
        if (score > 100) score = 100;

        boolean flagged = !issues.isEmpty();

        String summary;
        if (score >= 90) {
            summary = "This request appears complete and well-documented. Minor items, if any, are listed below.";
        } else if (score >= 70) {
            summary = "This request is mostly complete but has a few issues that may delay payer review.";
        } else if (score >= 40) {
            summary = "This request has several gaps that are likely to result in a pended or rejected determination.";
        } else {
            summary = "This request is missing critical information required for payer review and should not be submitted as-is.";
        }

        if (!flagged) {
            recommendations.add("No issues detected. The request is ready for submission.");
        }

        CopilotReviewResponse response = new CopilotReviewResponse();
        response.setCompletenessScore(score);
        response.setFlaggedIssues(flagged);
        response.setIssues(issues);
        response.setRecommendations(recommendations);
        response.setSummary(summary);
        return response;
    }

    private boolean isBlank(String s) {
        return s == null || s.trim().isEmpty();
    }
}
