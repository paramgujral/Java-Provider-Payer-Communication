package com.healthcare.fhir.dto;

public class FhirOutboundResponse {
    private boolean success;
    private int httpStatus;
    private String message;
    private String responseBody;

    public FhirOutboundResponse() {}

    public FhirOutboundResponse(boolean success, int httpStatus, String message, String responseBody) {
        this.success = success;
        this.httpStatus = httpStatus;
        this.message = message;
        this.responseBody = responseBody;
    }

    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }
    public int getHttpStatus() { return httpStatus; }
    public void setHttpStatus(int httpStatus) { this.httpStatus = httpStatus; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public String getResponseBody() { return responseBody; }
    public void setResponseBody(String responseBody) { this.responseBody = responseBody; }
}
