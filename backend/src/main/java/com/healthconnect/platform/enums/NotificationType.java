package com.healthconnect.platform.enums;

public enum NotificationType {
    REQUEST_APPROVED("Request Approved"),
    REQUEST_DENIED("Request Denied"),
    INFO_REQUESTED("Information Requested"),
    AI_WARNING("AI Validation Warning");

    private final String displayName;

    NotificationType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
