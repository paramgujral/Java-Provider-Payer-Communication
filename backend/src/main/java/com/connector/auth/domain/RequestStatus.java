package com.connector.auth.domain;

/** Lifecycle of a prior-authorization request. */
public enum RequestStatus {
    DRAFT, SUBMITTED, PENDING_REVIEW, INFO_REQUESTED, APPROVED, DENIED, CANCELLED
}
