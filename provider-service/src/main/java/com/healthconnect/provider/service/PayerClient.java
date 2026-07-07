package com.healthconnect.provider.service;

import com.healthconnect.common.fhir.FhirNames;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

/** HTTP client for the payer's FHIR endpoint. */
@Component
public class PayerClient {

    private static final Logger log = LoggerFactory.getLogger(PayerClient.class);

    private final RestClient payerRestClient;

    public PayerClient(RestClient payerRestClient) {
        this.payerRestClient = payerRestClient;
    }

    public String submitClaimBundle(String bundleJson) {
        try {
            return payerRestClient.post()
                    .uri("/fhir/Claim/$submit")
                    .contentType(MediaType.parseMediaType(FhirNames.FHIR_JSON))
                    .body(bundleJson)
                    .retrieve()
                    .body(String.class);
        } catch (RestClientException e) {
            log.error("Failed to submit claim bundle to payer: {}", e.getMessage());
            throw new PayerUnavailableException("Payer service is unreachable — please try again shortly.", e);
        }
    }

    public static class PayerUnavailableException extends RuntimeException {
        public PayerUnavailableException(String message, Throwable cause) {
            super(message, cause);
        }
    }
}
