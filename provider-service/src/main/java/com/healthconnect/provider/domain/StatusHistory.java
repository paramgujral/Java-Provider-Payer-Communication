package com.healthconnect.provider.domain;

import com.healthconnect.common.model.AuthorizationStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;

/** A status transition record. */
@Entity
@Table(name = "status_history")
public class StatusHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long requestId;

    @Enumerated(EnumType.STRING)
    private AuthorizationStatus fromStatus;

    @Enumerated(EnumType.STRING)
    private AuthorizationStatus toStatus;

    private String actor;

    @Column(length = 2000)
    private String note;

    private Instant occurredAt;

    public StatusHistory() {
    }

    public StatusHistory(Long requestId, AuthorizationStatus fromStatus, AuthorizationStatus toStatus,
                         String actor, String note) {
        this.requestId = requestId;
        this.fromStatus = fromStatus;
        this.toStatus = toStatus;
        this.actor = actor;
        this.note = note;
        this.occurredAt = Instant.now();
    }

    public Long getId() { return id; }
    public Long getRequestId() { return requestId; }
    public AuthorizationStatus getFromStatus() { return fromStatus; }
    public AuthorizationStatus getToStatus() { return toStatus; }
    public String getActor() { return actor; }
    public String getNote() { return note; }
    public Instant getOccurredAt() { return occurredAt; }
}
