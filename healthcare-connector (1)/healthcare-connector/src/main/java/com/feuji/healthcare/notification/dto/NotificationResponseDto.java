package com.feuji.healthcare.notification.dto;

import com.feuji.healthcare.notification.enums.NotificationType;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponseDto {

    private Long id;

    private String title;

    private String message;

    private NotificationType notificationType;

    private Boolean isRead;
}
