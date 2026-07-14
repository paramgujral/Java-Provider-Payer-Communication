package com.feuji.healthcare_connector.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class GeminiAIService {

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.url}")
    private String apiUrl;

    @Value("${gemini.api.temperature:0.3}")
    private double temperature;

    @Value("${gemini.api.max-tokens:2048}")
    private int maxTokens;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @SuppressWarnings("rawtypes")
    public Map<String, Object> validateRequestData(Map<String, Object> requestData) {
        try {
            String inputJson = objectMapper.writeValueAsString(requestData);

            String prompt = "You are an Insurance Authorization Assistant for healthcare prior authorization requests.\n" +
                    "You are NOT a medical diagnosis tool. You validate insurance paperwork completeness and consistency.\n\n" +
                    "Your job is to review the authorization request data and:\n" +
                    "1. Identify missing mandatory fields (patient info, insurance, diagnosis, procedure, cost, notes).\n" +
                    "2. Validate the ICD-10 diagnosis code format (pattern: X##.### or similar alphanumeric, e.g. M17.11) and check consistency with the diagnosis description.\n" +
                    "3. Validate the CPT procedure code format (5-digit numeric, e.g. 27447) and check alignment with the diagnosis.\n" +
                    "4. Detect data inconsistencies (e.g. pregnancy diagnosis for male patient, pediatric procedure for elderly).\n" +
                    "5. Evaluate whether the claim amount is reasonable for the procedure type.\n" +
                    "6. Identify missing supporting documents based on the procedure type.\n" +
                    "7. Check if clinical notes are sufficient to support medical necessity.\n" +
                    "8. Detect potential duplicate requests.\n" +
                    "9. Generate a clinical summary.\n" +
                    "10. Estimate approval probability (HIGH/MEDIUM/LOW).\n" +
                    "11. Calculate a quality score (0-100).\n" +
                    "12. Assess risk level (LOW/MEDIUM/HIGH/CRITICAL).\n" +
                    "13. Provide auto-correction suggestions where possible (e.g. spelling corrections, code updates).\n" +
                    "14. Explain the reason behind every recommendation.\n\n" +
                    "Respond ONLY in valid, structured JSON. Do NOT include markdown formatting or markdown code blocks (like ```json).\n\n" +
                    "Required JSON format:\n" +
                    "{\n" +
                    "  \"qualityScore\": <number 0-100>,\n" +
                    "  \"approvalProbability\": \"<HIGH|MEDIUM|LOW>\",\n" +
                    "  \"riskLevel\": \"<LOW|MEDIUM|HIGH|CRITICAL>\",\n" +
                    "  \"overallStatus\": \"<PASS|NEEDS_ATTENTION|CRITICAL_ISSUES>\",\n" +
                    "  \"missingFields\": [{\"field\": \"fieldName\", \"severity\": \"ERROR|WARNING\", \"message\": \"error description\"}],\n" +
                    "  \"recommendations\": [{\"category\": \"DIAGNOSIS|PROCEDURE|DOCUMENTATION|COST\", \"message\": \"description of recommendation\", \"suggestion\": \"what to do\", \"reason\": \"why this recommendation is made\"}],\n" +
                    "  \"autoCorrections\": [{\"field\": \"fieldName\", \"currentValue\": \"val\", \"suggestedValue\": \"newVal\", \"reason\": \"why it should be updated\"}],\n" +
                    "  \"clinicalSummary\": \"summarized medical context of the authorization request\",\n" +
                    "  \"requiredDocuments\": [\"List of doc names required (e.g. X-Ray Report, Blood Work)\"],\n" +
                    "  \"warnings\": [{\"type\": \"CLINICAL_CONFLICT|COST_ALERT|COVERAGE_CHECK\", \"message\": \"description of warning\"}]\n" +
                    "}\n\n" +
                    "Input data to validate:\n" +
                    inputJson;

            Map<String, Object> requestBody = new HashMap<>();
            
            List<Map<String, Object>> contents = new ArrayList<>();
            Map<String, Object> contentObj = new HashMap<>();
            List<Map<String, Object>> parts = new ArrayList<>();
            Map<String, Object> partObj = new HashMap<>();
            partObj.put("text", prompt);
            parts.add(partObj);
            contentObj.put("parts", parts);
            contents.add(contentObj);
            requestBody.put("contents", contents);

            Map<String, Object> generationConfig = new HashMap<>();
            generationConfig.put("temperature", temperature);
            generationConfig.put("maxOutputTokens", maxTokens);
            generationConfig.put("responseMimeType", "application/json");
            requestBody.put("generationConfig", generationConfig);

            String fullUrl = apiUrl + "?key=" + apiKey;
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(fullUrl, entity, Map.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map responseMap = response.getBody();
                List candidates = (List) responseMap.get("candidates");
                if (candidates != null && !candidates.isEmpty()) {
                    Map candidate = (Map) candidates.get(0);
                    Map content = (Map) candidate.get("content");
                    if (content != null) {
                        List pParts = (List) content.get("parts");
                        if (pParts != null && !pParts.isEmpty()) {
                            Map part = (Map) pParts.get(0);
                            String responseText = (String) part.get("text");
                            
                            @SuppressWarnings("unchecked")
                            Map<String, Object> result = objectMapper.readValue(responseText, Map.class);
                            return result;
                        }
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Gemini AI validation request failed: " + e.getMessage());
        }
        return null;
    }
}
