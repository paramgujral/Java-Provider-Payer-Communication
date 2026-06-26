package com.healthcare.connector.authorization.enums;

public enum AuthorizationStatus {
    DRAFT,
    PENDING_REVIEW,       // Submitted by provider, awaiting AI review
    AI_REVIEWED,          // AI copilot has reviewed
    SUBMITTED,            // Submitted to payer
    UNDER_REVIEW,         // Payer is reviewing
    APPROVED,
    PARTIALLY_APPROVED,
    DENIED,
    PENDING_INFO,         // Payer requesting more info
    CANCELLED,
    EXPIRED
}