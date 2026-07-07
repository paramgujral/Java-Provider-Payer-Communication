package com.healthconnect.provider.copilot;

import com.healthconnect.provider.domain.AuthorizationRequest;

import java.util.List;

/** A source of copilot findings. */
public interface CopilotAdvisor {

    String name();

    /** Disabled advisors are skipped. */
    default boolean enabled() {
        return true;
    }

    List<CopilotFinding> review(AuthorizationRequest request);
}
