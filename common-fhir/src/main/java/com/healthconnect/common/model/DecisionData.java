package com.healthconnect.common.model;

/** A payer decision or acknowledgement, carried as a FHIR ClaimResponse. */
public class DecisionData {

    private String requestNumber;
    private String caseNumber;
    private AuthorizationStatus status;
    private String note;

    public DecisionData() {
    }

    public DecisionData(String requestNumber, String caseNumber, AuthorizationStatus status, String note) {
        this.requestNumber = requestNumber;
        this.caseNumber = caseNumber;
        this.status = status;
        this.note = note;
    }

    public String getRequestNumber() { return requestNumber; }
    public void setRequestNumber(String requestNumber) { this.requestNumber = requestNumber; }

    public String getCaseNumber() { return caseNumber; }
    public void setCaseNumber(String caseNumber) { this.caseNumber = caseNumber; }

    public AuthorizationStatus getStatus() { return status; }
    public void setStatus(AuthorizationStatus status) { this.status = status; }

    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
}
