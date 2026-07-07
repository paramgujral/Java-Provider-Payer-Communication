package com.healthconnect.common.model;

import java.util.EnumSet;
import java.util.Map;
import java.util.Set;

/** Lifecycle states of a prior-authorization request. */
public enum AuthorizationStatus {

    DRAFT,
    SUBMITTED,
    PENDING_REVIEW,
    INFO_REQUESTED,
    APPROVED,
    REJECTED;

    private static final Map<AuthorizationStatus, Set<AuthorizationStatus>> ALLOWED = Map.of(
            DRAFT, EnumSet.of(SUBMITTED),
            SUBMITTED, EnumSet.of(PENDING_REVIEW, APPROVED, REJECTED, INFO_REQUESTED),
            PENDING_REVIEW, EnumSet.of(APPROVED, REJECTED, INFO_REQUESTED),
            INFO_REQUESTED, EnumSet.of(SUBMITTED),
            APPROVED, EnumSet.noneOf(AuthorizationStatus.class),
            REJECTED, EnumSet.noneOf(AuthorizationStatus.class)
    );

    public boolean canTransitionTo(AuthorizationStatus target) {
        return ALLOWED.get(this).contains(target);
    }

    public boolean isTerminal() {
        return ALLOWED.get(this).isEmpty();
    }

    public boolean isEditable() {
        return this == DRAFT || this == INFO_REQUESTED;
    }
}
