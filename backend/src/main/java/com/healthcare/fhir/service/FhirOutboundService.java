package com.healthcare.fhir.service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;

import org.springframework.stereotype.Service;

import com.healthcare.fhir.dto.FhirOutboundRequest;
import com.healthcare.fhir.dto.FhirOutboundResponse;

@Service
public class FhirOutboundService {

    private final HttpClient httpClient = HttpClient.newHttpClient();

    public FhirOutboundResponse sendToPayer(FhirOutboundRequest request) {
        try {
            HttpRequest httpRequest = HttpRequest.newBuilder()
                    .uri(URI.create(request.getPayerUrl()))
                    .header("Content-Type", "application/fhir+json")
                    .POST(HttpRequest.BodyPublishers.ofString(request.getResourceJson(), StandardCharsets.UTF_8))
                    .build();

            HttpResponse<String> response = httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofString());
            boolean success = response.statusCode() >= 200 && response.statusCode() < 300;
            return new FhirOutboundResponse(success, response.statusCode(), success ? "Sent to payer" : "Payer request failed", response.body());
        } catch (Exception e) {
            return new FhirOutboundResponse(false, 500, "Failed to send to payer: " + e.getMessage(), null);
        }
    }
}
