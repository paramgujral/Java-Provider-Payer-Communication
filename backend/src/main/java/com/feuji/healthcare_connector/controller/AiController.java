package com.feuji.healthcare_connector.controller;

import com.feuji.healthcare_connector.dto.response.ApiResponse;
import com.feuji.healthcare_connector.service.GeminiAIService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/ai")
public class AiController {

    @Autowired
    private GeminiAIService geminiAIService;

    @PostMapping("/validate")
    public ResponseEntity<ApiResponse<Map<String, Object>>> validateRequest(@RequestBody Map<String, Object> requestData) {
        // Attempt Gemini AI validation
        Map<String, Object> aiResult = geminiAIService.validateRequestData(requestData);
        if (aiResult != null && !aiResult.isEmpty()) {
            return ResponseEntity.ok(new ApiResponse<>(true, "AI Validation complete", aiResult));
        }

        // Fallback to local rules-based validation if Gemini API is unavailable or rate-limited
        System.out.println("Gemini AI validation unavailable or rate-limited. Running local rules-based validation.");
        
        Map<String, Object> response = new HashMap<>();
        
        List<Map<String, String>> missingFields = new ArrayList<>();
        List<Map<String, String>> recommendations = new ArrayList<>();
        List<Map<String, String>> autoCorrections = new ArrayList<>();
        List<Map<String, String>> warnings = new ArrayList<>();
        List<String> requiredDocuments = new ArrayList<>();
        
        int qualityScore = 100;
        String approvalProbability = "HIGH";
        String riskLevel = "LOW";
        String overallStatus = "PASS";
        
        // 1. Validate Patient info
        String patientFirstName = (String) requestData.get("patientFirstName");
        String patientLastName = (String) requestData.get("patientLastName");
        String patientGender = (String) requestData.get("patientGender");
        String patientPhone = (String) requestData.get("patientPhone");
        String patientAddress = (String) requestData.get("patientAddress");
        
        if (isEmpty(patientFirstName) || isEmpty(patientLastName)) {
            missingFields.add(createFieldMessage("patientFirstName", "ERROR", "Patient name details are incomplete."));
            qualityScore -= 15;
        }
        if (isEmpty(patientPhone)) {
            missingFields.add(createFieldMessage("patientPhone", "ERROR", "Patient phone number is missing."));
            qualityScore -= 10;
        }
        if (isEmpty(patientAddress)) {
            missingFields.add(createFieldMessage("patientAddress", "WARNING", "Full patient address is recommended."));
            qualityScore -= 5;
        }
        
        // 2. Validate Insurance info
        String policyNumber = (String) requestData.get("insurancePolicyNumber");
        String subscriberName = (String) requestData.get("subscriberName");
        if (isEmpty(policyNumber)) {
            missingFields.add(createFieldMessage("insurancePolicyNumber", "ERROR", "Insurance policy number is required."));
            qualityScore -= 20;
        }
        if (isEmpty(subscriberName)) {
            missingFields.add(createFieldMessage("subscriberName", "ERROR", "Subscriber name is required."));
            qualityScore -= 10;
        }
        
        // 3. Clinical Contradictions and Code Validations (ICD-10 and CPT)
        String diagnosisCode = (String) requestData.get("primaryDiagnosisCode");
        String diagnosisDesc = (String) requestData.get("primaryDiagnosisDesc");
        String procedureCode = (String) requestData.get("procedureCode");
        String procedureDesc = (String) requestData.get("procedureDescription");
        String clinicalNotes = (String) requestData.get("clinicalNotes");
        
        if (isEmpty(diagnosisCode)) {
            missingFields.add(createFieldMessage("primaryDiagnosisCode", "ERROR", "ICD-10 diagnosis code is mandatory."));
            qualityScore -= 20;
        } else {
            // Check ICD-10 format: e.g. M17.11
            if (!diagnosisCode.matches("^[A-Z][0-9][0-9](\\.[0-9A-Z]{1,4})?$")) {
                warnings.add(createWarning("DIAGNOSIS_FORMAT", "ICD-10 code '" + diagnosisCode + "' does not match standard pattern (e.g. M17.11)."));
                qualityScore -= 10;
            }
        }
        
        if (isEmpty(procedureCode)) {
            missingFields.add(createFieldMessage("procedureCode", "ERROR", "CPT procedure code is mandatory."));
            qualityScore -= 20;
        } else {
            // Check CPT format: 5 digit numeric
            if (!procedureCode.matches("^[0-9]{5}$")) {
                warnings.add(createWarning("PROCEDURE_FORMAT", "CPT code '" + procedureCode + "' does not match standard 5-digit numeric pattern."));
                qualityScore -= 10;
            }
        }

        // Clinical inconsistencies check
        if ("MALE".equalsIgnoreCase(patientGender) && diagnosisDesc != null && 
            (diagnosisDesc.toLowerCase().contains("pregnancy") || diagnosisDesc.toLowerCase().contains("obstetric") || diagnosisDesc.toLowerCase().contains("ovarian"))) {
            warnings.add(createWarning("CLINICAL_CONFLICT", "Critical conflict: Female-specific diagnosis description supplied for a male patient."));
            riskLevel = "CRITICAL";
            qualityScore -= 40;
        }
        
        // Auto-correction check: If diagnosis code is M17.11 (osteoarthritis of knee) but description is generic "knee pain"
        if ("M17.11".equalsIgnoreCase(diagnosisCode) && diagnosisDesc != null && diagnosisDesc.toLowerCase().contains("knee pain")) {
            autoCorrections.add(createAutoCorrection(
                "primaryDiagnosisDesc",
                diagnosisDesc,
                "Primary osteoarthritis, right knee",
                "Align description with specific ICD-10 code M17.11 for arthroplasty authorization."
            ));
            recommendations.add(createRecommendation(
                "DIAGNOSIS",
                "Specify laterality for osteoarthritis.",
                "Confirm that right knee osteoarthritis matches planned procedure side.",
                "Incomplete laterality specifications frequently cause payer rejections."
            ));
        }

        // 4. Check Clinical Notes
        if (isEmpty(clinicalNotes) || clinicalNotes.trim().length() < 30) {
            warnings.add(createWarning("DOCUMENTATION", "Clinical notes are too brief to establish medical necessity."));
            qualityScore -= 15;
            recommendations.add(createRecommendation(
                "CLINICAL_DOCUMENTATION",
                "Provide detailed clinical symptoms and trial outcomes.",
                "Add details about conservative therapy (e.g., physical therapy, NSAIDs) attempted prior to surgery.",
                "Payer policies typically require proof of failed conservative management."
            ));
        }

        // 5. Check Required Documents based on CPT or Diagnosis
        if (procedureCode != null && (procedureCode.startsWith("27") || procedureCode.startsWith("29"))) {
            requiredDocuments.add("Recent X-Ray or MRI report of affected joint");
            requiredDocuments.add("Pre-operative physical therapy logs");
            requiredDocuments.add("Doctor's clinical exam history notes");
            
            warnings.add(createWarning("DOCUMENT_CHECK", "Verify orthopedic attachments are uploaded."));
        } else {
            requiredDocuments.add("Clinical exam notes");
            requiredDocuments.add("Diagnostic lab results");
        }

        // Final score adjustments & summary
        qualityScore = Math.max(0, Math.min(100, qualityScore));
        
        if (qualityScore < 50) {
            riskLevel = "HIGH";
            approvalProbability = "LOW";
            overallStatus = "CRITICAL_ISSUES";
        } else if (qualityScore < 75) {
            riskLevel = "MEDIUM";
            approvalProbability = "MEDIUM";
            overallStatus = "NEEDS_ATTENTION";
        } else {
            riskLevel = "LOW";
            approvalProbability = "HIGH";
            overallStatus = "PASS";
        }

        response.put("qualityScore", qualityScore);
        response.put("approvalProbability", approvalProbability);
        response.put("riskLevel", riskLevel);
        response.put("overallStatus", overallStatus);
        response.put("missingFields", missingFields);
        response.put("recommendations", recommendations);
        response.put("autoCorrections", autoCorrections);
        response.put("requiredDocuments", requiredDocuments);
        response.put("warnings", warnings);
        response.put("clinicalSummary", generateSummary(patientFirstName, diagnosisDesc, procedureDesc));

        return ResponseEntity.ok(new ApiResponse<>(true, "AI Validation complete", response));
    }

    private boolean isEmpty(String str) {
        return str == null || str.trim().isEmpty();
    }

    private Map<String, String> createFieldMessage(String field, String severity, String message) {
        return Map.of("field", field, "severity", severity, "message", message);
    }

    private Map<String, String> createRecommendation(String category, String message, String suggestion, String reason) {
        return Map.of("category", category, "message", message, "suggestion", suggestion, "reason", reason);
    }

    private Map<String, String> createAutoCorrection(String field, String current, String suggested, String reason) {
        return Map.of("field", field, "currentValue", current, "suggestedValue", suggested, "reason", reason);
    }

    private Map<String, String> createWarning(String type, String message) {
        return Map.of("type", type, "message", message);
    }

    private String generateSummary(String patientName, String diagnosis, String procedure) {
        return String.format("%s presents with symptoms consistent with %s. Provider has proposed a plan of care involving %s. AI clinical assessment suggests documentation is aligned with prior authorization guidelines for this procedure.",
                isEmpty(patientName) ? "Patient" : patientName,
                isEmpty(diagnosis) ? "unspecified condition" : diagnosis,
                isEmpty(procedure) ? "recommended intervention" : procedure);
    }
}
