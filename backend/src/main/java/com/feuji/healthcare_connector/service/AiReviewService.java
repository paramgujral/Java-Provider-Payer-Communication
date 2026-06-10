package com.feuji.healthcare_connector.service;

import com.feuji.healthcare_connector.entity.AuthorizationRequest;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class AiReviewService {

    public record AiReviewResult(
            boolean valid,
            String recommendation,
            String reason
    ) {}

    public AiReviewResult review(AuthorizationRequest request) {

        List<String> corrections = new ArrayList<>();

        if (isBlank(request.patientName)) {
            corrections.add("Patient name is missing.");
        }

        if (isBlank(request.memberId)) {
            corrections.add("Member ID is missing.");
        }

        if (isBlank(request.providerName)) {
            corrections.add("Provider name is missing.");
        }

        if (isBlank(request.payerName)) {
            corrections.add("Payer name is missing.");
        }

        if (isBlank(request.diagnosisCode)) {
            corrections.add("Diagnosis code is missing. Add ICD-10 diagnosis code like E11.9.");
        } else if (!isValidDiagnosisCode(request.diagnosisCode)) {
            corrections.add("Diagnosis code should be ICD-10 format like E11.9 or F11.0.");
        }

        if (isBlank(request.procedureCode)) {
            corrections.add("Procedure code is missing. Add CPT/HCPCS procedure code.");
        } else if (!isValidProcedureCode(request.procedureCode)) {
            corrections.add("Procedure code should be 5-digit CPT code like 99213 or HCPCS code like A1234.");
        }

        if (isBlank(request.clinicalNotes) || request.clinicalNotes.length() < 20) {
            corrections.add("Clinical notes are too short. Add medical necessity and supporting details.");
        }

        if (!corrections.isEmpty()) {
            return new AiReviewResult(
                    false,
                    "NEEDS_CORRECTION",
                    String.join(" ", corrections)
            );
        }

        return new AiReviewResult(
                true,
                "READY_TO_SUBMIT",
                "AI Copilot review passed. Required authorization fields are present and coding format looks valid."
        );
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }

    private boolean isValidDiagnosisCode(String code) {
        return code != null && code.toUpperCase().matches("^[A-TV-Z][0-9][A-Z0-9](\\.?[A-Z0-9]{0,4})?$");
    }

    private boolean isValidProcedureCode(String code) {
        return code != null && code.toUpperCase().matches("^([0-9]{5}|[A-Z][0-9]{4})$");
    }
}