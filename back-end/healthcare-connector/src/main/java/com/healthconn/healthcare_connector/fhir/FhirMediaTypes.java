package com.healthconn.healthcare_connector.fhir;

import org.springframework.http.MediaType;

/**
 * Shared FHIR media types for all /fhir APIs.
 */
public final class FhirMediaTypes {

    public static final String FHIR_JSON = "application/fhir+json";
    public static final String JSON = MediaType.APPLICATION_JSON_VALUE;

    public static final String[] PRODUCES = { FHIR_JSON, JSON };
    public static final String[] CONSUMES = { FHIR_JSON, JSON };

    private FhirMediaTypes() {
    }
}
