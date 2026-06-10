package com.connector.auth.dto;

/** Payer adjudication payload. decision = APPROVED | DENIED | INFO_REQUESTED | PARTIAL */
public class DecisionDto {
    public String decision;
    public String rationale;
    public String authorizationNumber;   // for APPROVED
    public String authValidFrom;
    public String authValidTo;
}
