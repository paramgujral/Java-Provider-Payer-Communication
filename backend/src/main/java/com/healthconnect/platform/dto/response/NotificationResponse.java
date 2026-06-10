package com.healthconnect.platform.dto.response;

import com.healthconnect.platform.enums.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponse {
    private Long id;
    private NotificationType type;
    private String typeDisplayName;
    private String title;
    private String message;
    private boolean read;
    private Long requestId;
    private String referenceNumber;
    private LocalDateTime createdAt;
}
