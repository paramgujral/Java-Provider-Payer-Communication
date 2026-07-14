package com.healthconn.healthcare_connector.notification.entity;

/**
 * Types of notifications supported by the Healthcare Connector.
 */
public enum NotificationType {

    NEW_REQUEST("New Authorization Request"),

    REQUEST_APPROVED("Authorization Request Approved"),

    REQUEST_REJECTED("Authorization Request Rejected"),

    REQUEST_UNDER_REVIEW("Authorization Request Under Review"),

    GENERAL("General Notification");

    private final String description;

    NotificationType(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}