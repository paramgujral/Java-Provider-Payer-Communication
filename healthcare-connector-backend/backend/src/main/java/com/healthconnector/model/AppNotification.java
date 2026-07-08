package com.healthconnector.model;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "app_notification")
public class AppNotification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String message;

    @Enumerated(EnumType.STRING)
    private UserRole recipientRole;

    private String recipientUsername; // null = broadcast to all users of recipientRole

    private Long requestId;

    private boolean read = false;

    private LocalDateTime createdAt = LocalDateTime.now();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public UserRole getRecipientRole() { return recipientRole; }
    public void setRecipientRole(UserRole recipientRole) { this.recipientRole = recipientRole; }

    public String getRecipientUsername() { return recipientUsername; }
    public void setRecipientUsername(String recipientUsername) { this.recipientUsername = recipientUsername; }

    public Long getRequestId() { return requestId; }
    public void setRequestId(Long requestId) { this.requestId = requestId; }

    public boolean isRead() { return read; }
    public void setRead(boolean read) { this.read = read; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
