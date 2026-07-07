package com.healthcareconnector.model;

public class Notification {
    private String id;
    private String username;
    private String message;
    private String requestId;
    private boolean read;
    private String createdAt;

    public Notification() {}

    public Notification(String id, String username, String message, String requestId, boolean read, String createdAt) {
        this.id = id;
        this.username = username;
        this.message = message;
        this.requestId = requestId;
        this.read = read;
        this.createdAt = createdAt;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getRequestId() { return requestId; }
    public void setRequestId(String requestId) { this.requestId = requestId; }

    public boolean isRead() { return read; }
    public void setRead(boolean read) { this.read = read; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
}
