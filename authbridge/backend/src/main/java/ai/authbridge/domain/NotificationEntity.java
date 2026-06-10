package ai.authbridge.domain;

import ai.authbridge.domain.Enums.NotificationChannel;
import ai.authbridge.domain.Enums.Role;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

/** A notification destined for a provider or payer user, across one or more channels. */
@Entity
@Table(name = "notification")
public class NotificationEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Enumerated(EnumType.STRING)
    private Role role;

    private UUID requestId;
    private String referenceNo;
    private String title;

    @Column(length = 1000)
    private String body;

    @Enumerated(EnumType.STRING)
    private NotificationChannel channel = NotificationChannel.IN_APP;

    private boolean read = false;
    private Instant createdAt = Instant.now();

    public UUID getId() { return id; }
    public Role getRole() { return role; }
    public void setRole(Role v) { this.role = v; }
    public UUID getRequestId() { return requestId; }
    public void setRequestId(UUID v) { this.requestId = v; }
    public String getReferenceNo() { return referenceNo; }
    public void setReferenceNo(String v) { this.referenceNo = v; }
    public String getTitle() { return title; }
    public void setTitle(String v) { this.title = v; }
    public String getBody() { return body; }
    public void setBody(String v) { this.body = v; }
    public NotificationChannel getChannel() { return channel; }
    public void setChannel(NotificationChannel v) { this.channel = v; }
    public boolean isRead() { return read; }
    public void setRead(boolean v) { this.read = v; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant v) { this.createdAt = v; }
}
