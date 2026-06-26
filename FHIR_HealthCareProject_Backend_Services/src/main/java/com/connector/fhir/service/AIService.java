package com.connector.fhir.service;

import com.connector.fhir.dto.AIReviewResultDto;
import com.connector.fhir.dto.AuthorizationRequestDto;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class AIService {

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    public AIReviewResultDto analyzeRequest(AuthorizationRequestDto dto) {
        // 1. Get API Key and Model Name from Environment Variables
        String apiKey = System.getenv("GEMINI_API_KEY");
        if (apiKey == null || apiKey.trim().isEmpty()) {
            apiKey = System.getenv("GOOGLE_API_KEY");
        }
        
        String model = System.getenv("GEMINI_MODEL");
        if (model == null || model.trim().isEmpty()) {
            model = "gemini-3.5-flash-medium"; // Default model as per user request
        }

        // If no API Key is provided, fallback gracefully to Rule-Based validation
        if (apiKey == null || apiKey.trim().isEmpty()) {
            System.out.println("Warning: GEMINI_API_KEY or GOOGLE_API_KEY environment variable is missing. Falling back to local rule-based AI validation.");
            return analyzeRuleBased(dto);
        }

        try {
            // Build the prompt content
            String diagnosisCode = dto.getDiagnosisCode() != null ? dto.getDiagnosisCode() : "N/A";
            String diagnosisDesc = dto.getDiagnosisDescription() != null ? dto.getDiagnosisDescription() : "N/A";
            String treatmentCode = dto.getTreatmentCode() != null ? dto.getTreatmentCode() : "N/A";
            String treatmentDesc = dto.getTreatmentDescription() != null ? dto.getTreatmentDescription() : "N/A";
            String notes = dto.getNotes() != null ? dto.getNotes() : "N/A";

            String prompt = String.format(
                    "You are an intelligent clinical prior authorization reviewer. Analyze this request and identify warnings or critical errors:\n" +
                    "- Patient Diagnosis Code: %s (%s)\n" +
                    "- Treatment/Procedure Code: %s (%s)\n" +
                    "- Physician Clinical Notes: %s\n\n" +
                    "Your tasks are:\n" +
                    "1. Detect missing clinical details (e.g. are notes empty, are codes missing).\n" +
                    "2. Detect format errors (e.g. invalid ICD-10 or CPT code formatting).\n" +
                    "3. Compute a confidence score (double between 10.0 and 100.0) indicating how likely this request is to be approved based on medical guidelines. If critical codes are missing, confidence score must be below 60.0.\n" +
                    "4. Suggest specific attachments or clinical records required (e.g. MRI reports for knee codes, ECG reports for heart codes, pathology records for oncology codes) to speed up payer review.\n\n" +
                    "Generate a JSON response conforming strictly to the requested schema. Return JSON only.",
                    diagnosisCode, diagnosisDesc, treatmentCode, treatmentDesc, notes
            );

            // Configure JSON schema for structured Gemini outputs
            Map<String, Object> confidenceScoreSchema = Map.of(
                    "type", "NUMBER", 
                    "description", "Score representing prior authorization completeness and approval probability between 10.0 and 100.0"
            );
            Map<String, Object> statusValidationSchema = Map.of(
                    "type", "BOOLEAN", 
                    "description", "True if all required clinical elements are present, false if critical fields are missing"
            );
            Map<String, Object> issuesSchema = Map.of(
                    "type", "ARRAY", 
                    "items", Map.of("type", "STRING"), 
                    "description", "List of critical warning messages or missing elements detected"
            );
            Map<String, Object> recommendationsSchema = Map.of(
                    "type", "ARRAY", 
                    "items", Map.of("type", "STRING"), 
                    "description", "Specific physician notes or radiological attachment suggestions"
            );

            Map<String, Object> jsonSchema = Map.of(
                    "type", "OBJECT",
                    "properties", Map.of(
                            "confidenceScore", confidenceScoreSchema,
                            "statusValidation", statusValidationSchema,
                            "issues", issuesSchema,
                            "recommendations", recommendationsSchema
                    ),
                    "required", List.of("confidenceScore", "statusValidation", "issues", "recommendations")
            );

            Map<String, Object> generationConfig = Map.of(
                    "responseMimeType", "application/json",
                    "responseSchema", jsonSchema
            );

            Map<String, Object> requestBodyMap = Map.of(
                    "contents", List.of(Map.of("parts", List.of(Map.of("text", prompt)))),
                    "generationConfig", generationConfig
            );

            String requestBody = objectMapper.writeValueAsString(requestBodyMap);
            String url = String.format("https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s", model, apiKey);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .timeout(Duration.ofSeconds(12))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() == 200) {
                String responseBody = response.body();
                Map<String, Object> respMap = objectMapper.readValue(responseBody, Map.class);
                List<Map<String, Object>> candidates = (List<Map<String, Object>>) respMap.get("candidates");
                if (candidates != null && !candidates.isEmpty()) {
                    Map<String, Object> candidate = candidates.get(0);
                    Map<String, Object> contentMap = (Map<String, Object>) candidate.get("content");
                    if (contentMap != null) {
                        List<Map<String, Object>> partsList = (List<Map<String, Object>>) contentMap.get("parts");
                        if (partsList != null && !partsList.isEmpty()) {
                            String aiJsonText = (String) partsList.get(0).get("text");
                            return objectMapper.readValue(aiJsonText, AIReviewResultDto.class);
                        }
                    }
                }
            } else {
                System.err.println("Gemini API call failed with status: " + response.statusCode() + ". Body: " + response.body());
            }

        } catch (Exception e) {
            System.err.println("Exception occurred while calling Gemini API: " + e.getMessage());
        }

        System.out.println("Falling back to local rule-based AI review due to API failure.");
        return analyzeRuleBased(dto);
    }

    private AIReviewResultDto analyzeRuleBased(AuthorizationRequestDto dto) {
        List<String> issues = new ArrayList<>();
        List<String> recommendations = new ArrayList<>();
        double score = 100.0;

        // 1. Check Missing Diagnosis
        if (dto.getDiagnosisCode() == null || dto.getDiagnosisCode().trim().isEmpty()) {
            issues.add("Critical: Diagnosis code is missing (ICD-10 code is required).");
            score -= 25.0;
        } else {
            String diag = dto.getDiagnosisCode().trim();
            if (!diag.matches("^[A-Z][0-9][0-9A-Z](\\.[0-9A-Z]{1,4})?$")) {
                issues.add("Warning: Diagnosis code '" + diag + "' may not conform to standard ICD-10 formatting.");
                score -= 10.0;
            }
            
            if (diag.startsWith("M")) {
                recommendations.add("Attach relevant radiological imaging reports (X-ray, MRI, or CT scans).");
                recommendations.add("Attach documented physical therapy trials and conservative management records.");
            } else if (diag.startsWith("I")) {
                recommendations.add("Attach recent electrocardiogram (ECG) tracings and echocardiogram reports.");
                recommendations.add("Include summary of prior cardiac stress tests or angiogram results.");
            } else if (diag.startsWith("C")) {
                recommendations.add("Attach histopathology/biopsy pathology reports.");
                recommendations.add("Include treatment plan details signed by an oncologist.");
            }
        }

        // 2. Check Missing Treatment CPT
        if (dto.getTreatmentCode() == null || dto.getTreatmentCode().trim().isEmpty()) {
            issues.add("Critical: Treatment procedure code is missing (CPT/HCPCS code is required).");
            score -= 25.0;
        } else {
            String cpt = dto.getTreatmentCode().trim();
            if (!cpt.matches("^[0-9]{4}[0-9A-Z]$")) {
                issues.add("Warning: Treatment code '" + cpt + "' does not match standard CPT code syntax.");
                score -= 10.0;
            }
        }

        // 3. Check Patient & Coverage
        if (dto.getPatientId() == null) {
            issues.add("Critical: Patient reference is not specified.");
            score -= 15.0;
        }
        if (dto.getCoverageId() == null) {
            issues.add("Critical: Insurance coverage profile is not selected.");
            score -= 15.0;
        }

        // 4. Check Clinical Notes
        if (dto.getNotes() == null || dto.getNotes().trim().isEmpty()) {
            issues.add("Warning: Clinical rationale notes are empty. Payer reviews are highly likely to request additional info.");
            recommendations.add("Provide a detailed clinical description of the patient's current symptoms.");
            score -= 15.0;
        } else if (dto.getNotes().trim().length() < 30) {
            issues.add("Warning: Clinical notes are extremely brief.");
            recommendations.add("Expand clinical justification details in physician notes.");
            score -= 5.0;
        } else {
            recommendations.add("Clinical documentation length is sufficient for primary automated scanning.");
        }

        recommendations.add("Ensure physician name, signature, and date are present on all uploaded documents.");
        score = Math.max(10.0, Math.min(100.0, score));
        boolean isValid = issues.stream().noneMatch(issue -> issue.startsWith("Critical"));

        return new AIReviewResultDto(score, isValid, issues, recommendations);
    }
}
