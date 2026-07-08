package com.healthconnector.service;

import com.healthconnector.dto.ValidationResultDto;
import com.healthconnector.model.AuthorizationRequest;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

/**
 * Rule-based stand-in for the AI Copilot. Checks structural/completeness
 * rules similar to what a real LLM-backed copilot would flag before a
 * request is sent to the payer. Replace with an LLM-backed CopilotValidator
 * later without touching ProviderController or AuthorizationService.
 */
@Service
public class RuleBasedCopilotValidator implements CopilotValidator {

    private static final Pattern ICD10_PATTERN = Pattern.compile("^[A-Z][0-9]{2}(\\.[0-9A-Z]{1,4})?$");

    @Override
    public ValidationResultDto validate(AuthorizationRequest r) {
        List<ValidationResultDto.Issue> issues = new ArrayList<>();

        if (isBlank(r.getPatientName())) {
            issues.add(issue("patientName", "Patient name is required."));
        }
        if (isBlank(r.getPatientDob())) {
            issues.add(issue("patientDob", "Date of birth is required."));
        }
        if (isBlank(r.getPatientGender())) {
            issues.add(issue("patientGender", "Patient gender is required."));
        }
        if (isBlank(r.getDiagnosisCode())) {
            issues.add(issue("diagnosisCode", "Diagnosis code (ICD-10) is required."));
        } else if (!ICD10_PATTERN.matcher(r.getDiagnosisCode().trim()).matches()) {
            issues.add(issue("diagnosisCode", "Diagnosis code does not look like a valid ICD-10 code (e.g. E11.9)."));
        }
        if (isBlank(r.getDiagnosisDescription())) {
            issues.add(issue("diagnosisDescription", "Diagnosis description is required."));
        }
        if (isBlank(r.getRequestedProcedure())) {
            issues.add(issue("requestedProcedure", "Requested procedure is required."));
        }
        if (isBlank(r.getInsuranceProvider())) {
            issues.add(issue("insuranceProvider", "Insurance provider (payer) is required."));
        }
        if (isBlank(r.getPolicyNumber())) {
            issues.add(issue("policyNumber", "Policy number is required."));
        }
        if (isBlank(r.getMemberId())) {
            issues.add(issue("memberId", "Member ID is required."));
        }

        return new ValidationResultDto(issues.isEmpty(), issues);
    }

    private boolean isBlank(String s) {
        return s == null || s.trim().isEmpty();
    }

    private ValidationResultDto.Issue issue(String field, String message) {
        return new ValidationResultDto.Issue(field, message);
    }
}
