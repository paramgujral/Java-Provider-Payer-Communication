package com.healthconnect.payer.service;

import com.healthconnect.common.fhir.FhirNames;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

/** Sends decision ClaimResponses to the provider's callback endpoint. */
@Component
public class ProviderClient {

    private static final Logger log = LoggerFactory.getLogger(ProviderClient.class);
    private static final int MAX_ATTEMPTS = 3;

    private final RestClient providerRestClient;

    public ProviderClient(RestClient providerRestClient) {
        this.providerRestClient = providerRestClient;
    }

    /** @return true when delivered. */
    public boolean sendDecision(String claimResponseJson) {
        for (int attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
            try {
                providerRestClient.post()
                        .uri("/api/callbacks/decision")
                        .contentType(MediaType.parseMediaType(FhirNames.FHIR_JSON))
                        .body(claimResponseJson)
                        .retrieve()
                        .toBodilessEntity();
                return true;
            } catch (Exception e) {
                log.warn("Decision callback to provider failed (attempt {}/{}): {}",
                        attempt, MAX_ATTEMPTS, e.getMessage());
            }
        }
        return false;
    }
}
