package com.healthcare.fhir.validation;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class FhirValidationSupportServiceTest {

    @Test
    void initializeShouldPopulateBundledValidationStatus() {
        FhirValidationSupportService service = new FhirValidationSupportService();

        service.initialize();

        assertThat(service.getStatus().isConfigured()).isTrue();
        assertThat(service.getStatus().getMessages()).isNotEmpty();
    }
}
