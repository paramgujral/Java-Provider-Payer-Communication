package com.healthcare.fhir.dto;

import jakarta.validation.constraints.NotBlank;

public class FhirOutboundRequest {

    @NotBlank
    private String payerUrl;

    @NotBlank
    private String resourceJson;

    public String getPayerUrl() { return payerUrl; }
    public void setPayerUrl(String payerUrl) { this.payerUrl = payerUrl; }
    public String getResourceJson() { return resourceJson; }
    public void setResourceJson(String resourceJson) { this.resourceJson = resourceJson; }
}
