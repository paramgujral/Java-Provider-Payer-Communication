package com.healthconnect.provider.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;

/** In-app notification. */
@Entity
@Table(name = "notifications")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @Column(length = 1000)
    private String message;

    /** INFO, SUCCESS, WARNING or ERROR. */
    private String type;

    private Long referenceId;

    @Column(name = "is_read")
    private boolean read;

    private Instant createdAt;

    public Notification() {
    }

    public Notification(String title, String message, String type, Long referenceId) {
        this.title = title;
        this.message = message;
        this.type = type;
        this.referenceId = referenceId;
        this.createdAt = Instant.now();
    }

    public Long getId() { return id; }
    public String getTitle() { return title; }
    public String getMessage() { return message; }
    public String getType() { return type; }
    public Long getReferenceId() { return referenceId; }
    public boolean isRead() { return read; }
    public void setRead(boolean read) { this.read = read; }
    public Instant getCreatedAt() { return createdAt; }
}
