package com.healthconn.healthcare_connector.notification.dto;

import com.healthconn.healthcare_connector.notification.entity.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class WsNotificationPayload {
    private final String title;
    private final String message;
    private final NotificationType type;
    private final Long requestId;
    private final LocalDateTime createdAt;
}
