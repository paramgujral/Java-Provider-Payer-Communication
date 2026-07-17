package com.healthcare.fhir.dto;

import java.util.List;

public class FhirValidationResponse {
    private boolean valid;
    private List<FhirValidationIssue> issues;

    public FhirValidationResponse() {}

    public FhirValidationResponse(boolean valid, List<FhirValidationIssue> issues) {
        this.valid = valid;
        this.issues = issues;
    }

    public boolean isValid() { return valid; }
    public void setValid(boolean valid) { this.valid = valid; }
    public List<FhirValidationIssue> getIssues() { return issues; }
    public void setIssues(List<FhirValidationIssue> issues) { this.issues = issues; }
}
