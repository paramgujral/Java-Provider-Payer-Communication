package ai.authbridge.workflow;

import ai.authbridge.domain.AuthorizationRequest;
import ai.authbridge.domain.Enums.NotificationChannel;
import ai.authbridge.domain.Enums.RequestStatus;
import ai.authbridge.domain.Enums.Role;
import ai.authbridge.domain.TimelineEvent;
import ai.authbridge.notification.NotificationService;
import ai.authbridge.repository.Repositories.AuthorizationRequestRepository;
import java.util.Map;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

/**
 * The workflow engine. Owns all status transitions, enforces the legal state machine
 * (see {@link RequestStatus#canTransitionTo}), appends the immutable audit event, and notifies
 * the counterparty. This is the single choke-point through which a request's lifecycle moves.
 */
@Service
public class WorkflowService {

    private static final Map<RequestStatus, String> ACTION = Map.of(
            RequestStatus.SUBMITTED, "Submitted to payer",
            RequestStatus.IN_REVIEW, "Started review",
            RequestStatus.INFO_REQUESTED, "Requested additional information",
            RequestStatus.APPROVED, "Approved",
            RequestStatus.DENIED, "Denied",
            RequestStatus.RESUBMITTED, "Resubmitted"
    );

    private final AuthorizationRequestRepository requests;
    private final NotificationService notifications;

    public WorkflowService(AuthorizationRequestRepository requests, NotificationService notifications) {
        this.requests = requests;
        this.notifications = notifications;
    }

    @Transactional
    public AuthorizationRequest transition(UUID id, RequestStatus to, String actorName, Role actorRole, String note) {
        AuthorizationRequest r = requests.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Request not found"));

        RequestStatus from = r.getStatus();
        if (!from.canTransitionTo(to)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Illegal transition " + from + " → " + to);
        }

        r.setStatus(to);
        if (note != null && !note.isBlank()) r.setDecisionNote(note);
        r.addEvent(TimelineEvent.of(actorName, actorRole, ACTION.getOrDefault(to, "Updated"))
                .withTransition(from, to).withNote(note));

        // Notify the counterparty in-app; escalate to email for terminal decisions.
        Role target = actorRole == Role.PAYER ? Role.PROVIDER : Role.PAYER;
        NotificationChannel channel = (to == RequestStatus.APPROVED || to == RequestStatus.DENIED
                || to == RequestStatus.INFO_REQUESTED) ? NotificationChannel.EMAIL : NotificationChannel.IN_APP;
        notifications.notify(target, r, titleFor(to),
                note != null ? note : r.getServiceRequested() + " is now " + to.name().toLowerCase().replace('_', ' '),
                channel);

        return requests.save(r);
    }

    @Transactional
    public AuthorizationRequest assignReviewer(UUID id, String reviewer) {
        AuthorizationRequest r = requests.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Request not found"));
        r.setAssignedReviewer(reviewer);
        r.addEvent(TimelineEvent.of(r.getPayerOrg(), Role.PAYER, "Assigned to reviewer").withNote(reviewer));
        return requests.save(r);
    }

    private String titleFor(RequestStatus to) {
        return switch (to) {
            case APPROVED -> "Request approved";
            case DENIED -> "Request denied";
            case INFO_REQUESTED -> "Additional information requested";
            case IN_REVIEW -> "Request under review";
            case SUBMITTED, RESUBMITTED -> "New authorization request";
            default -> "Request updated";
        };
    }
}
