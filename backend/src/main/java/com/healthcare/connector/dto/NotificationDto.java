package com.healthcare.connector.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class NotificationDto {
    private String id;
    private String type;
    private String title;
    private String message;
    private LocalDateTime timestamp;
    private boolean read;
    private String actionUrl;
    private String relatedId;
}
