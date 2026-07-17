package com.healthcare.fhir.dto;

public class FhirValidationIssue {
    private String severity;
    private String message;
    private String location;

    public FhirValidationIssue() {}

    public FhirValidationIssue(String severity, String message, String location) {
        this.severity = severity;
        this.message = message;
        this.location = location;
    }

    public String getSeverity() { return severity; }
    public void setSeverity(String severity) { this.severity = severity; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
}
