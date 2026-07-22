package com.healthcare.connector.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.healthcare.connector.entity.AuthorizationRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;
import java.util.Map;

@Service
public class GeminiService {

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.model}")
    private String model;

    private final WebClient webClient = WebClient.builder()
            .baseUrl("https://generativelanguage.googleapis.com")
            .build();

    private final ObjectMapper mapper = new ObjectMapper();

    public String reviewRequest(AuthorizationRequest request) {

        String prompt = """
You are an AI Healthcare Input Validation Engine.

Your ONLY responsibility is to validate the correctness of every input field.

DO NOT perform medical review.
DO NOT provide explanations.

Validate every field individually.

Rules

1. Patient First Name
- Required
- Only alphabets and spaces
- Reject numbers
- Reject special characters such as @ # $ %% ^ & * ( ) _ + = ! ? < > /

2. Patient Last Name
- Same rules.

3. Date of Birth
- Required
- Format yyyy-MM-dd
- Must not be a future date.

4. Gender
Allowed values:
Male
Female
Other

5. Mobile Number
- Exactly 10 digits.

6. Email
- Must be a valid email.

7. Insurance ID
- Letters and numbers only.

8. Insurance Company
- Letters, numbers and spaces only.

9. Member ID
- Letters and numbers only.

10. Policy Number
- Letters and numbers only.

11. Group Number
- Letters and numbers only.

12. Provider Name
- Letters, numbers and spaces only.

13. Provider NPI
- Exactly 10 digits.

14. Provider Address
- Letters, numbers, commas, periods and spaces only.

15. Diagnosis
- Must be meaningful medical text.
- Reject random symbols.
- Reject only numbers.
- Reject gibberish like abc123.

16. Diagnosis Code
- Must be valid ICD-10.

17. Procedure Name
- Must be meaningful.

18. Procedure Code
- Must be valid CPT.

19. Priority
Allowed values:
Low
Medium
High
Urgent

20. Requested Date
- Must be valid.

21. Expected Service Date
- Cannot be before Requested Date.

22. Clinical Notes
- Must contain meaningful medical information.
- Reject symbols like @#$%%%%^^.

Return ONLY JSON.

Example:

{
  "valid": false,
  "errors": [
    {
      "field":"Patient First Name",
      "message":"Only alphabets are allowed."
    }
  ]
}

If every field is valid return

{
  "valid": true,
  "errors": []
}

Patient First Name: %s
Patient Last Name: %s
Date Of Birth: %s
Gender: %s
Mobile Number: %s
Email: %s

Insurance ID: %s
Insurance Company: %s
Member ID: %s
Policy Number: %s
Group Number: %s

Provider Name: %s
Provider NPI: %s
Provider Address: %s

Diagnosis: %s
Diagnosis Code: %s

Procedure Name: %s
Procedure Code: %s

Priority: %s

Requested Date: %s
Expected Service Date: %s

Clinical Notes:
%s
"""
                .formatted(
                        request.getPatientFirstName(),
                        request.getPatientLastName(),
                        request.getDateOfBirth(),
                        request.getGender(),
                        request.getMobileNumber(),
                        request.getEmail(),
                        request.getInsuranceId(),
                        request.getInsuranceCompany(),
                        request.getMemberId(),
                        request.getPolicyNumber(),
                        request.getGroupNumber(),
                        request.getProviderName(),
                        request.getProviderNpi(),
                        request.getProviderAddress(),
                        request.getDiagnosis(),
                        request.getDiagnosisCode(),
                        request.getProcedureName(),
                        request.getProcedureCode(),
                        request.getPriority(),
                        request.getRequestedDate(),
                        request.getExpectedServiceDate(),
                        request.getClinicalNotes()
                );

        Map<String, Object> body = Map.of(
                "contents",
                List.of(
                        Map.of(
                                "parts",
                                List.of(
                                        Map.of("text", prompt)
                                )
                        )
                )
        );

        try {

            String response = webClient.post()
                    .uri("/v1beta/models/" + model + ":generateContent?key=" + apiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(body)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            JsonNode root = mapper.readTree(response);

            String text = root
                    .path("candidates")
                    .get(0)
                    .path("content")
                    .path("parts")
                    .get(0)
                    .path("text")
                    .asText();

            return text
                    .replace("```json", "")
                    .replace("```", "")
                    .trim();

        } catch (Exception e) {

            e.printStackTrace();

            return """
            {
              "valid": false,
              "errors":[
                {
                  "field":"Gemini AI",
                  "message":"Unable to validate request. Please try again."
                }
              ]
            }
            """;
        }
    }
}