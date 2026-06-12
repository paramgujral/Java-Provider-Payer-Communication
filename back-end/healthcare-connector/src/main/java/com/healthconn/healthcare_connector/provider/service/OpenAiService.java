package com.healthconn.healthcare_connector.provider.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
public class OpenAiService {

    @Value("${openai.api.key}")
    private String apiKey;

    private static final String OPENAI_URL =
            "https://api.openai.com/v1/chat/completions";

    private final RestTemplate restTemplate = new RestTemplate();

    public String getFieldSuggestion(String fieldName,
                                     String fieldValue,
                                     String diagnosisCode,
                                     String procedureCode,
                                     String treatmentDescription) {

        String prompt = buildPrompt(fieldName, fieldValue,
                diagnosisCode, procedureCode, treatmentDescription);

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(apiKey);
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> body = Map.of(
                "model", "gpt-4o-mini",
                "messages", List.of(Map.of("role", "user", "content", prompt)),
                "max_tokens", 60,
                "temperature", 0.4
        );

        ResponseEntity<Map> response = restTemplate.exchange(
                OPENAI_URL,
                HttpMethod.POST,
                new HttpEntity<>(body, headers),
                Map.class
        );

        if (response.getBody() == null) {
            throw new RuntimeException("Empty response from OpenAI");
        }

        List<?> choices = (List<?>) response.getBody().get("choices");
        Map<?, ?> message = (Map<?, ?>) ((Map<?, ?>) choices.get(0)).get("message");
        return message.get("content").toString().trim();
    }

    private String buildPrompt(String fieldName, String fieldValue,
                               String diagnosisCode, String procedureCode,
                               String treatmentDescription) {
        return switch (fieldName) {

            case "patientName" -> String.format("""
                    The user typed "%s" as a patient name in a medical form.
                    If it looks like a real full name (first + last), reply: "✓ Looks good"
                    If it is incomplete, gibberish, or only one word, suggest 2–3 realistic
                    full name examples like: "Did you mean: James Carter, Priya Sharma, or Michael Scott?"
                    Reply with only that short suggestion. No explanation.""",
                    fieldValue);

            case "patientId" -> String.format("""
                    The user typed "%s" as a Patient ID in a medical authorization form.
                    Valid Patient IDs are alphanumeric, 4–12 characters, e.g. PT2048, PAT00312.
                    If valid, reply: "✓ Looks good"
                    If invalid (too short, all numbers, special chars), reply with:
                    "Expected format: PT followed by digits, e.g. PT2048 or PAT00312"
                    Reply with only that. No explanation.""",
                    fieldValue);

            case "insuranceId" -> String.format("""
                    The user typed "%s" as an Insurance ID in a medical authorization form.
                    Valid Insurance IDs are alphanumeric with optional hyphens, 5–20 chars,
                    e.g. BCBS71628163, SHEYF71628, UHC-0023847.
                    If the input is all digits or looks like a phone number, it is wrong.
                    If valid, reply: "✓ Looks good"
                    If invalid, reply with a corrected example:
                    "Expected format: e.g. BCBS71628163 or UHC-0023847"
                    Reply with only that. No explanation.""",
                    fieldValue);

            case "diagnosisCode" -> String.format("""
                    The user typed "%s" as an ICD-10 diagnosis code.
                    Valid ICD-10 format: one letter followed by 2 digits, optional decimal + 1-4 digits.
                    Examples: E11.9, J18.9, I10, M54.5
                    If valid, reply: "✓ Valid ICD-10 code — [brief name of condition]"
                    If invalid, reply: "Expected ICD-10 format, e.g. E11.9 or J18.9"
                    Reply with only that. No explanation.""",
                    fieldValue);

            case "procedureCode" -> String.format("""
                    The user typed "%s" as a CPT procedure code. Context: ICD-10 is %s.
                    Valid CPT codes are exactly 5 digits, e.g. 99213, 27447, 93000.
                    If valid, reply: "✓ CPT %s — [brief name of procedure]"
                    If invalid (not 5 digits), reply: "Expected 5-digit CPT code, e.g. 99213 or 27447"
                    Reply with only that. No explanation.""",
                    fieldValue, diagnosisCode, fieldValue);

            case "treatmentDescription" -> String.format("""
                    The user wrote this treatment description: "%s"
                    ICD-10: %s, CPT: %s
                    If the description is clear and specific, reply: "✓ Description looks good"
                    If it is vague or too short, rewrite it in 1 sentence as it should be written,
                    starting with "Suggested: ..."
                    Reply with only that. No explanation.""",
                    fieldValue, diagnosisCode, procedureCode);

            case "admissionDate" -> String.format("""
                    The user entered admission date: "%s".
                    If it is a valid future or today's date, reply: "✓ Date looks good"
                    If it is in the past (retro-auth needed), reply:
                    "Note: Retro-authorization may be required for past dates"
                    Reply with only that. No explanation.""",
                    fieldValue);

            case "expectedDischargeDate" -> String.format("""
                    The user entered expected discharge date: "%s". Admission date context unknown.
                    If it looks like a valid near-future date, reply: "✓ Date looks good"
                    If it seems too far out or in the past, reply:
                    "Suggested: discharge date is typically 3–7 days after admission"
                    Reply with only that. No explanation.""",
                    fieldValue);

            case "priority" -> String.format("""
                    The provider selected priority: "%s" for a medical authorization.
                    Reply with one short line:
                    - NORMAL: "Standard 3–5 business day review applies"
                    - URGENT: "Urgent requires clinical justification within 24 hours"
                    - EMERGENCY: "Emergency — same-day review, attach ER documentation"
                    Reply with only that line. No explanation.""",
                    fieldValue);

            default -> String.format("""
                    Field: %s, Value: "%s".
                    If the value looks correct for this field, reply: "✓ Looks good"
                    Otherwise suggest the correct format in one short line.
                    Reply with only that. No explanation.""",
                    fieldName, fieldValue);
        };
    }
}