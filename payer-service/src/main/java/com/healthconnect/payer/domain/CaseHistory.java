package com.healthconnect.payer.domain;

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
@Table(name = "case_history")
public class CaseHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long caseId;

    @Enumerated(EnumType.STRING)
    private AuthorizationStatus fromStatus;

    @Enumerated(EnumType.STRING)
    private AuthorizationStatus toStatus;

    private String actor;

    @Column(length = 2000)
    private String note;

    private Instant occurredAt;

    public CaseHistory() {
    }

    public CaseHistory(Long caseId, AuthorizationStatus fromStatus, AuthorizationStatus toStatus,
                       String actor, String note) {
        this.caseId = caseId;
        this.fromStatus = fromStatus;
        this.toStatus = toStatus;
        this.actor = actor;
        this.note = note;
        this.occurredAt = Instant.now();
    }

    public Long getId() { return id; }
    public Long getCaseId() { return caseId; }
    public AuthorizationStatus getFromStatus() { return fromStatus; }
    public AuthorizationStatus getToStatus() { return toStatus; }
    public String getActor() { return actor; }
    public String getNote() { return note; }
    public Instant getOccurredAt() { return occurredAt; }
}
