package com.healthcare.connector.notification.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

public class NotificationDTO {
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NotificationResponse {
        private Long id;
        private String title;
        private String message;
        private String type;
        private String referenceNumber;
        private Long authRequestId;
        private boolean read;
        private LocalDateTime readAt;
        private LocalDateTime createdAt;
        // Only safe fields from recipient — no proxy
        private String recipientUsername;
    }
}
