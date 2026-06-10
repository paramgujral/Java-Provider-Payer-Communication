package com.connector.auth.domain;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notification")
public class Notification {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long requestId;
    @Column(nullable = false) private String recipient;        // PROVIDER | PAYER
    @Column(nullable = false) private String title;
    @Lob @Column(columnDefinition = "TEXT") private String message;
    private String level = "INFO";                             // INFO | SUCCESS | WARNING | DANGER
    private Boolean readFlag = false;
    @Column(nullable = false) private LocalDateTime createdAt = LocalDateTime.now();

    public Notification() {}
    public Notification(Long requestId, String recipient, String title, String message, String level) {
        this.requestId = requestId; this.recipient = recipient;
        this.title = title; this.message = message; this.level = level;
    }

    public Long getId() { return id; }
    public Long getRequestId() { return requestId; }
    public void setRequestId(Long v) { this.requestId = v; }
    public String getRecipient() { return recipient; }
    public void setRecipient(String v) { this.recipient = v; }
    public String getTitle() { return title; }
    public void setTitle(String v) { this.title = v; }
    public String getMessage() { return message; }
    public void setMessage(String v) { this.message = v; }
    public String getLevel() { return level; }
    public void setLevel(String v) { this.level = v; }
    public Boolean getReadFlag() { return readFlag; }
    public void setReadFlag(Boolean v) { this.readFlag = v; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime v) { this.createdAt = v; }
}
