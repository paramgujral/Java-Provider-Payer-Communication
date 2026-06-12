package com.healthcare.connector.ai;

import com.healthcare.connector.dto.AiAnalysisResult;
import com.healthcare.connector.dto.AuthorizationRequest;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class ClinicalValidator {

    // Valid NPI format: 10 digits
    private static final String NPI_PATTERN = "^\\d{10}$";

    // Common ICD-10 codes with risk levels
    private static final Map<String, Integer> ICD10_RISK_MAP = Map.of(
            "I21", 90, // Acute MI - HIGH
            "I63", 85, // Stroke - HIGH
            "C34", 80, // Lung cancer - HIGH
            "J18", 40, // Pneumonia - MEDIUM
            "M54", 20, // Back pain - LOW
            "Z00", 10  // General checkup - LOW
    );

    // CPT codes that require additional documentation
    private static final Set<String> HIGH_REVIEW_CPT = new HashSet<>(Arrays.asList(
            "27447", "22612", "63047", "33533", "33534", "93306"
    ));

    public AiAnalysisResult analyze(AuthorizationRequest request) {
        AiAnalysisResult result = new AiAnalysisResult();
        List<String> issues = new ArrayList<>();
        List<String> suggestions = new ArrayList<>();
        int riskScore = 0;

        // 1. NPI Validation
        if (request.getNpiNumber() == null || !request.getNpiNumber().matches(NPI_PATTERN)) {
            issues.add("CRITICAL: Invalid NPI number format. Must be 10 digits.");
            riskScore += 30;
        } else {
            suggestions.add("NPI " + request.getNpiNumber() + " format is valid.");
        }

        // 2. ICD-10 Validation
        int icd10Risk = validateIcd10(request.getIcd10Code(), issues, suggestions);
        riskScore += icd10Risk;

        // 3. CPT Code Validation
        int cptRisk = validateCpt(request.getCptCode(), issues, suggestions);
        riskScore += cptRisk;

        // 4. Clinical Notes Analysis
        int notesRisk = validateClinicalNotes(request.getClinicalNotes(), issues, suggestions);
        riskScore += notesRisk;

        // 5. Demographics Check
        int demographicsRisk = validateDemographics(request, issues, suggestions);
        riskScore += demographicsRisk;

        // 6. Insurance Validation
        if (request.getInsuranceId() == null || request.getInsuranceId().isBlank()) {
            issues.add("WARNING: Insurance ID is missing.");
            riskScore += 10;
        }

        // Cap at 100
        riskScore = Math.min(riskScore, 100);

        result.setRiskScore(riskScore);
        result.setRiskLevel(determineRiskLevel(riskScore));
        result.setIssues(issues);
        result.setSuggestions(suggestions);
        result.setAnalysisSummary(buildSummary(riskScore, issues.size(), request));
        result.setAutoFixSuggestions(buildAutoFix(issues, request));

        return result;
    }

    private int validateIcd10(String icd10Code, List<String> issues, List<String> suggestions) {
        if (icd10Code == null || icd10Code.isBlank()) {
            issues.add("CRITICAL: ICD-10 code is required.");
            return 25;
        }

        String prefix = icd10Code.length() >= 3 ? icd10Code.substring(0, 3) : icd10Code;
        Integer baseRisk = ICD10_RISK_MAP.get(prefix);

        if (!icd10Code.matches("[A-Z][0-9]{2}(\\.[0-9A-Z]{1,4})?")) {
            issues.add("WARNING: ICD-10 code '" + icd10Code + "' may be malformed. Expected format: A00.0");
            return 15;
        }

        if (baseRisk != null && baseRisk >= 80) {
            issues.add("INFO: High-acuity diagnosis detected (" + icd10Code + "). Expedited review recommended.");
            suggestions.add("Attach supporting diagnostic reports for ICD-10 code " + icd10Code);
            return baseRisk / 4;
        }

        suggestions.add("ICD-10 code " + icd10Code + " format validated.");
        return baseRisk != null ? baseRisk / 5 : 5;
    }

    private int validateCpt(String cptCode, List<String> issues, List<String> suggestions) {
        if (cptCode == null || cptCode.isBlank()) {
            issues.add("CRITICAL: CPT code is required.");
            return 20;
        }
        if (!cptCode.matches("\\d{5}")) {
            issues.add("WARNING: CPT code '" + cptCode + "' is invalid. Must be 5 digits.");
            return 15;
        }
        if (HIGH_REVIEW_CPT.contains(cptCode)) {
            issues.add("INFO: CPT " + cptCode + " is a high-review procedure. Additional documentation required.");
            suggestions.add("Upload operative report or pre-authorization form for CPT " + cptCode);
            return 20;
        }
        suggestions.add("CPT code " + cptCode + " is valid.");
        return 0;
    }

    private int validateClinicalNotes(String notes, List<String> issues, List<String> suggestions) {
        if (notes == null || notes.trim().length() < 50) {
            issues.add("WARNING: Clinical notes are insufficient (< 50 characters). Detailed notes improve approval rates by 40%.");
            return 15;
        }
        // Check for key clinical terms
        String lowerNotes = notes.toLowerCase();
        boolean hasDiagnosis = lowerNotes.contains("diagnos") || lowerNotes.contains("condition");
        boolean hasTreatment = lowerNotes.contains("treatment") || lowerNotes.contains("procedure") || lowerNotes.contains("surgery");
        boolean hasHistory = lowerNotes.contains("history") || lowerNotes.contains("prior") || lowerNotes.contains("previous");

        if (!hasDiagnosis) {
            suggestions.add("Include explicit diagnosis description in clinical notes.");
        }
        if (!hasTreatment) {
            suggestions.add("Describe the proposed treatment or procedure in clinical notes.");
        }
        if (!hasHistory) {
            suggestions.add("Include relevant medical history and prior treatments attempted.");
        }
        return (!hasDiagnosis || !hasTreatment) ? 10 : 0;
    }

    private int validateDemographics(AuthorizationRequest request, List<String> issues, List<String> suggestions) {
        int risk = 0;
        if (request.getPatientName() == null || request.getPatientName().isBlank()) {
            issues.add("CRITICAL: Patient name is required.");
            risk += 10;
        }
        if (request.getPatientDob() == null || request.getPatientDob().isBlank()) {
            issues.add("WARNING: Patient date of birth is missing.");
            risk += 5;
        }
        if (request.getPatientMemberId() == null || request.getPatientMemberId().isBlank()) {
            issues.add("WARNING: Patient member ID is missing.");
            risk += 5;
        }
        return risk;
    }

    private String determineRiskLevel(int score) {
        if (score >= 70) return "RED";
        if (score >= 35) return "YELLOW";
        return "GREEN";
    }

    private String buildSummary(int riskScore, int issueCount, AuthorizationRequest req) {
        String level = determineRiskLevel(riskScore);
        return String.format(
            "AI Analysis complete for patient %s. Risk Score: %d%% (%s). " +
            "Found %d issue(s). Procedure: CPT %s for diagnosis ICD-10 %s. " +
            "%s",
            req.getPatientName() != null ? req.getPatientName() : "Unknown",
            riskScore, level, issueCount,
            req.getCptCode() != null ? req.getCptCode() : "N/A",
            req.getIcd10Code() != null ? req.getIcd10Code() : "N/A",
            level.equals("GREEN") ? "Request appears complete and ready for submission." :
            level.equals("YELLOW") ? "Minor issues detected. Review suggestions before submitting." :
            "Critical issues detected. Resolve before submission to avoid denial."
        );
    }

    private Map<String, String> buildAutoFix(List<String> issues, AuthorizationRequest request) {
        Map<String, String> fixes = new LinkedHashMap<>();
        for (String issue : issues) {
            if (issue.contains("NPI")) {
                fixes.put("npiNumber", "Please enter a valid 10-digit NPI number.");
            }
            if (issue.contains("ICD-10") && issue.contains("malformed")) {
                fixes.put("icd10Code", "Format should be: Letter + 2 digits + optional decimal (e.g., J18.9)");
            }
            if (issue.contains("CPT") && issue.contains("invalid")) {
                fixes.put("cptCode", "CPT code must be exactly 5 digits (e.g., 27447)");
            }
            if (issue.contains("clinical notes")) {
                fixes.put("clinicalNotes", "Add at least 50 characters describing diagnosis, treatment plan, and medical history.");
            }
        }
        return fixes;
    }
}
