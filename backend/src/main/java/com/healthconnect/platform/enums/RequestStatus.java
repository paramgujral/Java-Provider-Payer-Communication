package com.healthconnect.platform.enums;

public enum RequestStatus {
    DRAFT("Draft"),
    SUBMITTED("Submitted"),
    IN_REVIEW("In Review"),
    INFO_REQUESTED("Info Requested"),
    RESUBMITTED("Resubmitted"),
    APPROVED("Approved"),
    DENIED("Denied");

    private final String displayName;

    RequestStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
