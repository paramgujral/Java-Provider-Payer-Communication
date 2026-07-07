package com.healthconnect.common.model;

/** Clinical priority of the authorization request. */
public enum Urgency {
    ROUTINE,
    URGENT,
    EMERGENCY;

    public static Urgency fromString(String value) {
        if (value == null) {
            return ROUTINE;
        }
        try {
            return valueOf(value.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            return ROUTINE;
        }
    }
}
