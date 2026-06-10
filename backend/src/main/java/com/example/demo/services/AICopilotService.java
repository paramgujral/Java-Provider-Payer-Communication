package com.example.demo.services;

import com.example.demo.dto.AIReviewResponseDTO;
import com.example.demo.dto.AuthorizationRequestDTO;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class AICopilotService {

    private static final Logger log =
            LoggerFactory.getLogger(AICopilotService.class);

    @Value("${openai.api.key}")
    private String apiKey;

    @Value("${openai.model}")
    private String model;

    private final RestTemplate restTemplate = new RestTemplate();

    private final ReviewTokenStore reviewTokenStore;

    public AICopilotService(ReviewTokenStore reviewTokenStore) {
        this.reviewTokenStore = reviewTokenStore;
    }

    public AIReviewResponseDTO reviewRequest(
            AuthorizationRequestDTO request) {

        String prompt = """
You are a senior healthcare insurance authorization reviewer.

Review the authorization request and determine whether it contains enough information for submission to a payer.

Strictly evaluate the following:

1. Patient name must be present and meaningful.
2. Diagnosis must be specific and medically meaningful.
   - Reject vague values like:
     "Pain"
     "Problem"
     "Issue"
     "Injury"
     "Sick"
3. Procedure must be clearly described.
   - Reject vague values like:
     "Surgery"
     "Treatment"
     "Procedure"
     "Operation"
4. Check whether diagnosis and procedure logically align.
5. Identify missing, incomplete, vague, inconsistent, or low-quality information.
6. Be strict. If any critical field lacks detail, fail the review.

Authorization Request:

Patient Name: %s
Diagnosis: %s
Procedure: %s

Return ONLY valid JSON.

{
  "passed": true,
  "summary": "Short review summary",
  "issues": [],
  "suggestions": [],
  "confidenceScore": 95
}

Rules:

- passed=true only if the request is complete and sufficiently detailed.
- passed=false if any required information is missing, vague, generic, or inconsistent.
- issues must contain specific problems found.
- suggestions must contain actionable improvements.
- confidenceScore must be between 0 and 100.
- Return JSON only. No markdown. No explanation outside JSON.
"""
                .formatted(
                        request.getPatientName(),
                        request.getDiagnosis(),
                        request.getProcedureName()
                );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);

        Map<String, Object> body = Map.of(
                "model", model,
                "messages", List.of(
                        Map.of(
                                "role", "user",
                                "content", prompt
                        )
                )
        );

        HttpEntity<Map<String, Object>> entity =
                new HttpEntity<>(body, headers);

        ResponseEntity<Map> response =
                restTemplate.exchange(
                        "https://api.openai.com/v1/chat/completions",
                        HttpMethod.POST,
                        entity,
                        Map.class
                );
        log.info("Response : {}", response);
        List choices = (List) response.getBody().get("choices");
        Map choice = (Map) choices.get(0);
        Map message = (Map) choice.get("message");

        String content = message.get("content").toString();

        content = content
                .replace("```json", "")
                .replace("```", "")
                .trim();

        log.info("Response Body: {}", response.getBody());
        ObjectMapper mapper = new ObjectMapper();

        try {

            AIReviewResponseDTO aiResponse =
                    mapper.readValue(
                            content,
                            AIReviewResponseDTO.class
                    );

            if(aiResponse.isPassed()) {

                String token =
                        UUID.randomUUID().toString();

                aiResponse.setReviewToken(token);

                reviewTokenStore.add(token);
            }

            return aiResponse;

        } catch (Exception e) {

            e.printStackTrace();

            return AIReviewResponseDTO.builder()
                    .passed(false)
                    .summary("Unable to parse AI response")
                    .issues(List.of("AI response format error"))
                    .suggestions(List.of(
                            "Please review manually"))
                    .confidenceScore(0)
                    .build();
        }
    }

}
