package com.healthconn.healthcare_connector.notification.dto;

import com.healthconn.healthcare_connector.notification.entity.NotificationType;
import java.time.LocalDateTime;

public record WsNotificationPayload(
        String title,
        String message,
        NotificationType type,
        Long requestId,
        LocalDateTime createdAt
) {}