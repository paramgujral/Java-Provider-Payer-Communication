package com.healthcare.ai.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class GeminiService {

    @Value("${gemini.api.key}")
    private String apiKey;

    private final RestTemplate restTemplate;

    public String reviewRequest(String requestData) {

        String url =
                "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key="
                        + apiKey;

        String prompt = """
                You are an AI Copilot for a Healthcare Prior Authorization Platform.

                Your responsibility is to review authorization requests before they are submitted to the payer.

                Guidelines:

                - This is a demo application.
                - Diagnosis Code and Procedure Code are demo values.
                - Treat any non-empty Diagnosis Code and Procedure Code as valid.
                - Do NOT validate them against ICD-10 or CPT standards.
                - Never invent patient information.
                - Focus only on the information provided.
                - Review the request for completeness.
                - If mandatory fields are missing, mention them.
                - If clinical notes are too short or unclear, recommend adding symptoms, duration, previous treatment and medical necessity.
                - Keep the response professional and concise.
                - Keep the response under 200 words.

                Respond using the following format only:

                Summary:
                Briefly summarize whether the authorization request is complete or incomplete.

                Missing Information:
                Mention the missing mandatory fields.
                If nothing is missing, write "None".

                Clinical Notes Review:
                State whether the clinical notes are sufficient.
                If not, briefly explain what should be improved.

                Recommendations:
                Provide 3 or 4 short recommendations to improve the request.

                Authorization Request:

                """ + requestData;

        Map<String, Object> body = Map.of(
                "contents",
                List.of(
                        Map.of(
                                "parts",
                                List.of(
                                        Map.of(
                                                "text",
                                                prompt
                                        )
                                )
                        )
                ),
                "generationConfig",
                Map.of(
                        "temperature", 0.2,
                        "maxOutputTokens", 1024
                )
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> entity =
                new HttpEntity<>(body, headers);

        try {

            ResponseEntity<Map> response =
                    restTemplate.exchange(
                            url,
                            HttpMethod.POST,
                            entity,
                            Map.class);

            Map<String, Object> responseBody = response.getBody();

            if (responseBody == null) {
                return "AI Review could not be generated.";
            }

            List<Map<String, Object>> candidates =
                    (List<Map<String, Object>>) responseBody.get("candidates");

            if (candidates == null || candidates.isEmpty()) {
                return "No AI recommendation generated.";
            }

            Map<String, Object> content =
                    (Map<String, Object>) candidates.get(0).get("content");

            List<Map<String, Object>> parts =
                    (List<Map<String, Object>>) content.get("parts");

            return parts.get(0).get("text").toString().trim();

        } catch (HttpClientErrorException ex) {

            System.out.println("Gemini API Error:");
            System.out.println(ex.getResponseBodyAsString());

            return "Unable to contact AI Copilot. Please try again.";

        } catch (Exception ex) {

            ex.printStackTrace();

            return "Unexpected error while generating AI review.";
        }
    }
}