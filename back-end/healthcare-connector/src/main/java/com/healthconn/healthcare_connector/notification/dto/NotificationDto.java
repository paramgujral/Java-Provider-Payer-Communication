package com.healthconn.healthcare_connector.notification.dto;

import com.healthconn.healthcare_connector.notification.entity.NotificationType;

import java.time.LocalDateTime;

/**
 * Notification response sent to the frontend.
 */
public record NotificationDto(

        Long id,

        String title,

        String message,

        NotificationType type,

        Long requestId,

        boolean isRead,

        LocalDateTime createdAt

) {
}