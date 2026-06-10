package com.connector.auth.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "status_event")
public class StatusEvent {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "request_id")
    @JsonIgnore
    private AuthorizationRequest request;

    @Column(nullable = false) private String status;
    private String actor;                                      // PROVIDER | PAYER | COPILOT | SYSTEM
    @Lob @Column(columnDefinition = "TEXT") private String note;
    @Column(nullable = false) private LocalDateTime createdAt = LocalDateTime.now();

    public StatusEvent() {}
    public StatusEvent(String status, String actor, String note) {
        this.status = status; this.actor = actor; this.note = note;
    }

    public Long getId() { return id; }
    public AuthorizationRequest getRequest() { return request; }
    public void setRequest(AuthorizationRequest r) { this.request = r; }
    public String getStatus() { return status; }
    public void setStatus(String v) { this.status = v; }
    public String getActor() { return actor; }
    public void setActor(String v) { this.actor = v; }
    public String getNote() { return note; }
    public void setNote(String v) { this.note = v; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime v) { this.createdAt = v; }
}
