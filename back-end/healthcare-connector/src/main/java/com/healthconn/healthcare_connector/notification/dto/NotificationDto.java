package com.healthconn.healthcare_connector.notification.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.healthconn.healthcare_connector.notification.entity.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class NotificationDto {
    private final Long id;
    private final String title;
    private final String message;
    private final NotificationType type;
    private final Long requestId;
    @JsonProperty("isRead")
    private final boolean isRead;
    private final LocalDateTime createdAt;
}
