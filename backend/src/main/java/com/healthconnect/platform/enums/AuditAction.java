package com.healthconnect.platform.enums;

public enum AuditAction {
    CREATED("Request Created"),
    SUBMITTED("Submitted for Review"),
    REVIEWED("Under Review"),
    APPROVED("Request Approved"),
    DENIED("Request Denied"),
    RESUBMITTED("Request Resubmitted"),
    INFO_REQUESTED("Additional Information Requested");

    private final String displayName;

    AuditAction(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
