package com.healthconnect.common.model;

import org.junit.jupiter.api.Test;

import static com.healthconnect.common.model.AuthorizationStatus.APPROVED;
import static com.healthconnect.common.model.AuthorizationStatus.DRAFT;
import static com.healthconnect.common.model.AuthorizationStatus.INFO_REQUESTED;
import static com.healthconnect.common.model.AuthorizationStatus.PENDING_REVIEW;
import static com.healthconnect.common.model.AuthorizationStatus.REJECTED;
import static com.healthconnect.common.model.AuthorizationStatus.SUBMITTED;
import static org.assertj.core.api.Assertions.assertThat;

class AuthorizationStatusTest {

    @Test
    void happyPathTransitionsAreAllowed() {
        assertThat(DRAFT.canTransitionTo(SUBMITTED)).isTrue();
        assertThat(SUBMITTED.canTransitionTo(PENDING_REVIEW)).isTrue();
        assertThat(PENDING_REVIEW.canTransitionTo(APPROVED)).isTrue();
        assertThat(PENDING_REVIEW.canTransitionTo(REJECTED)).isTrue();
        assertThat(PENDING_REVIEW.canTransitionTo(INFO_REQUESTED)).isTrue();
    }

    @Test
    void resubmissionLoopIsAllowed() {
        assertThat(INFO_REQUESTED.canTransitionTo(SUBMITTED)).isTrue();
        assertThat(INFO_REQUESTED.isEditable()).isTrue();
    }

    @Test
    void terminalStatesAcceptNoTransitions() {
        assertThat(APPROVED.isTerminal()).isTrue();
        assertThat(REJECTED.isTerminal()).isTrue();
        assertThat(APPROVED.canTransitionTo(SUBMITTED)).isFalse();
        assertThat(REJECTED.canTransitionTo(PENDING_REVIEW)).isFalse();
    }

    @Test
    void illegalShortcutsAreBlocked() {
        assertThat(DRAFT.canTransitionTo(APPROVED)).isFalse();
        assertThat(DRAFT.canTransitionTo(PENDING_REVIEW)).isFalse();
        assertThat(PENDING_REVIEW.canTransitionTo(DRAFT)).isFalse();
    }
}
