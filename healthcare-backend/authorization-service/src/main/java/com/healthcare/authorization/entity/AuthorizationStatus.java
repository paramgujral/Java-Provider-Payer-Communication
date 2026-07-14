package com.healthcare.authorization.entity;

public enum AuthorizationStatus {
    CREATED,
    AI_REVIEW,
    SUBMITTED,
    UNDER_REVIEW,
    PENDING_INFO,
    APPROVED,
    REJECTED
}
