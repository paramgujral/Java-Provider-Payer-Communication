package com.healthcareconnector.service;

import com.healthcareconnector.model.AIReview;
import com.healthcareconnector.model.AuthorizationRequest;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

/**
 * AI Copilot: rule-based validation engine.
 *
 * In production, replace the body of reviewRequest() with a call to an LLM
 * (e.g. Claude via the Anthropic API), passing the FHIR-shaped request and
 * asking it to flag missing/inconsistent fields and suggest fixes. The
 * input/output shape (AuthorizationRequest -> AIReview) can stay identical
 * either way, so no other code needs to change.
 */
@Service
public class AiCopilotService {

    private static final Pattern CPT_PATTERN = Pattern.compile("^\\d{5}$");
    private static final Pattern ICD10_PATTERN = Pattern.compile("^[A-Za-z]\\d{2}(\\.\\d{1,2})?$");

    public AIReview reviewRequest(AuthorizationRequest req) {
        List<String> issues = new ArrayList<>();
        List<String> suggestions = new ArrayList<>();

        if (isBlank(req.getPatientName()) || req.getPatientName().trim().length() < 2) {
            issues.add("Patient name is missing or too short.");
        }

        if (isBlank(req.getDob())) {
            issues.add("Date of birth is missing.");
        } else {
            try {
                LocalDate dob = LocalDate.parse(req.getDob());
                if (dob.isAfter(LocalDate.now())) {
                    issues.add("Date of birth is invalid or in the future.");
                }
            } catch (DateTimeParseException e) {
                issues.add("Date of birth is invalid or in the future.");
            }
        }

        if (isBlank(req.getProcedureCode())) {
            issues.add("Procedure code (CPT) is required.");
        } else if (!CPT_PATTERN.matcher(req.getProcedureCode().trim()).matches()) {
            issues.add(String.format("Procedure code \"%s\" doesn't look like a valid 5-digit CPT code.", req.getProcedureCode()));
            suggestions.add("Double-check the CPT code — most codes are exactly 5 digits (e.g. 99213).");
        }

        if (isBlank(req.getDiagnosisCode())) {
            issues.add("Diagnosis code (ICD-10) is required.");
        } else if (!ICD10_PATTERN.matcher(req.getDiagnosisCode().trim()).matches()) {
            issues.add(String.format("Diagnosis code \"%s\" doesn't match standard ICD-10 format (e.g. E11.9).", req.getDiagnosisCode()));
            suggestions.add("ICD-10 codes usually look like a letter followed by two digits, optionally with a decimal (e.g. J45.909).");
        }

        if (isBlank(req.getProvider()) || req.getProvider().trim().length() < 2) {
            issues.add("Requesting provider/organization is required.");
        }

        if (isBlank(req.getPayer()) || req.getPayer().trim().length() < 2) {
            issues.add("Target payer is required.");
        }

        boolean urgent = "Urgent".equals(req.getUrgency());
        boolean notesTooShortForUrgent = isBlank(req.getNotes()) || req.getNotes().trim().length() < 20;
        if (urgent && notesTooShortForUrgent) {
            issues.add("Urgent requests require clinical justification notes (at least ~20 characters).");
            suggestions.add("Add a brief clinical rationale explaining why this request is urgent.");
        }

        if (!isBlank(req.getNotes()) && req.getNotes().trim().length() < 10) {
            suggestions.add("Consider adding more clinical context/notes to reduce the chance of payer follow-up questions.");
        }

        boolean isValid = issues.isEmpty();
        String summary = isValid
                ? "All required fields look complete and well-formed. Ready to submit."
                : String.format("Found %d issue(s) that should be fixed before submission.", issues.size());

        return new AIReview(isValid, Instant.now().toString(), issues, suggestions, summary);
    }

    private boolean isBlank(String s) {
        return s == null || s.trim().isEmpty();
    }
}
