package ai.authbridge.domain;

/** Domain enums shared across the platform. Mirrors the TypeScript types in the frontend. */
public final class Enums {
    private Enums() {}

    public enum Role { PROVIDER, PAYER, SYSTEM, COPILOT }

    public enum Priority { ROUTINE, URGENT, STAT }

    public enum RequestStatus {
        DRAFT, SUBMITTED, IN_REVIEW, INFO_REQUESTED, APPROVED, DENIED, RESUBMITTED;

        /** Legal next states from this status, enforced by the workflow engine. */
        public boolean canTransitionTo(RequestStatus to) {
            return switch (this) {
                case DRAFT -> to == SUBMITTED;
                case SUBMITTED, RESUBMITTED -> to == IN_REVIEW || to == INFO_REQUESTED || to == APPROVED || to == DENIED;
                case IN_REVIEW -> to == APPROVED || to == DENIED || to == INFO_REQUESTED;
                case INFO_REQUESTED -> to == RESUBMITTED || to == IN_REVIEW;
                case APPROVED, DENIED -> to == RESUBMITTED; // appeals / corrections
            };
        }
    }

    public enum Severity { ERROR, WARNING, INFO }

    public enum NotificationChannel { IN_APP, EMAIL, SMS }
}
