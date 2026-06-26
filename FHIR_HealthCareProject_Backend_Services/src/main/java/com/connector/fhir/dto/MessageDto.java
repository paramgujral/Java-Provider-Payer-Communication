package com.connector.fhir.dto;

import java.time.Instant;

public class MessageDto {
    private Long id;
    private Long requestId;
    private Long senderId;
    private String senderName;
    private String senderRole;
    private String message;
    private Instant createdAt;

    public MessageDto() {}

    public MessageDto(Long id, Long requestId, Long senderId, String senderName, String senderRole, String message, Instant createdAt) {
        this.id = id;
        this.requestId = requestId;
        this.senderId = senderId;
        this.senderName = senderName;
        this.senderRole = senderRole;
        this.message = message;
        this.createdAt = createdAt;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getRequestId() { return requestId; }
    public void setRequestId(Long requestId) { this.requestId = requestId; }

    public Long getSenderId() { return senderId; }
    public void setSenderId(Long senderId) { this.senderId = senderId; }

    public String getSenderName() { return senderName; }
    public void setSenderName(String senderName) { this.senderName = senderName; }

    public String getSenderRole() { return senderRole; }
    public void setSenderRole(String senderRole) { this.senderRole = senderRole; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
