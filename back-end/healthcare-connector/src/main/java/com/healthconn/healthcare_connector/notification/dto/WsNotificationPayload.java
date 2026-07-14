package com.healthconn.healthcare_connector.notification.dto;

import com.healthconn.healthcare_connector.notification.entity.NotificationType;

import java.time.LocalDateTime;

/**
 * WebSocket notification payload sent to connected clients.
 */
public record WsNotificationPayload(

        String title,

        String message,

        NotificationType type,

        Long requestId,

        LocalDateTime createdAt

) {
}