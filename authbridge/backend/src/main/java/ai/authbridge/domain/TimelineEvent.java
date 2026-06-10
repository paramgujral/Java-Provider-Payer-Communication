package ai.authbridge.domain;

import ai.authbridge.domain.Enums.RequestStatus;
import ai.authbridge.domain.Enums.Role;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

/**
 * An append-only audit event on a request's lifecycle. Rows are never updated or
 * deleted — this collection is the immutable audit trail required for compliance.
 */
@Entity
@Table(name = "timeline_event")
public class TimelineEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "request_id")
    private AuthorizationRequest request;

    @Column(nullable = false)
    private Instant at = Instant.now();

    private String actor;

    @Enumerated(EnumType.STRING)
    private Role role;

    private String action;

    @Column(length = 2000)
    private String note;

    @Enumerated(EnumType.STRING)
    private RequestStatus fromStatus;

    @Enumerated(EnumType.STRING)
    private RequestStatus toStatus;

    public static TimelineEvent of(String actor, Role role, String action) {
        TimelineEvent e = new TimelineEvent();
        e.actor = actor;
        e.role = role;
        e.action = action;
        return e;
    }

    public TimelineEvent withTransition(RequestStatus from, RequestStatus to) {
        this.fromStatus = from; this.toStatus = to; return this;
    }
    public TimelineEvent withNote(String n) { this.note = n; return this; }

    public UUID getId() { return id; }
    public AuthorizationRequest getRequest() { return request; }
    public void setRequest(AuthorizationRequest r) { this.request = r; }
    public Instant getAt() { return at; }
    public String getActor() { return actor; }
    public Role getRole() { return role; }
    public String getAction() { return action; }
    public String getNote() { return note; }
    public RequestStatus getFromStatus() { return fromStatus; }
    public RequestStatus getToStatus() { return toStatus; }
}
