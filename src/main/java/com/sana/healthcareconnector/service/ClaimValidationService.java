package com.sana.healthcareconnector.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sana.healthcareconnector.config.GeminiApiConfig;
import com.sana.healthcareconnector.dto.ClaimValidationRequestDTO;
import com.sana.healthcareconnector.dto.ClaimValidationResponseDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

@Service
public class ClaimValidationService {

    @Autowired
    private GeminiApiConfig geminiApiConfig;

    @Autowired
    private FhirBundleService fhirBundleService;

    private final HttpClient httpClient =
            HttpClient.newHttpClient();

    public ClaimValidationResponseDTO validate(
            ClaimValidationRequestDTO request) {

        try {

            String fhirJson = fhirBundleService.convertToFhir(request);

            System.out.println("FHIR JSON:");
            System.out.println(fhirJson);

            String prompt = """
                    You are a healthcare authorization AI copilot.
                    
                    Analyze the following FHIR payload and provide:
                    
                    1. Missing information
                    2. Recommendation
                    3. Validation result
                    4. Confidence score
                    
                    FHIR Payload:
                    %s
                    """.formatted(fhirJson);

            String url =
                    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key="
                            + geminiApiConfig.getApiKey();

            String requestBody = """
                    {
                      "contents": [
                        {
                          "parts": [
                            {
                              "text": "%s"
                            }
                          ]
                        }
                      ]
                    }
                    """.formatted(
                    prompt
                            .replace("\"", "\\\"")
                            .replace("\n", "\\n")
            );

            HttpRequest httpRequest =
                    HttpRequest.newBuilder()
                            .uri(URI.create(url))
                            .header(
                                    "Content-Type",
                                    "application/json"
                            )
                            .POST(
                                    HttpRequest.BodyPublishers.ofString(
                                            requestBody
                                    )
                            )
                            .build();

            HttpResponse<String> response =
                    httpClient.send(
                            httpRequest,
                            HttpResponse.BodyHandlers.ofString()
                    );

            String responseBody = response.body();

            System.out.println("Gemini Response:");
            System.out.println(responseBody);

            if (responseBody.contains("RESOURCE_EXHAUSTED")) {

                return new ClaimValidationResponseDTO(
                        "AI service temporarily unavailable due to API usage limits.",
                        0
                );
            }

            ObjectMapper objectMapper = new ObjectMapper();

            JsonNode root =
                    objectMapper.readTree(responseBody);

            String aiResponse =
                    root.path("candidates")
                            .get(0)
                            .path("content")
                            .path("parts")
                            .get(0)
                            .path("text")
                            .asText();

            return new ClaimValidationResponseDTO(
                    aiResponse,
                    95
            );

        } catch (Exception e) {

            e.printStackTrace();

            return new ClaimValidationResponseDTO(
                    "AI validation failed : "
                            + e.getMessage(),
                    0
            );
        }

    }}