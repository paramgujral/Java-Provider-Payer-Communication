package com.feuji.healthcare.notification.service;

import com.feuji.healthcare.notification.dto.NotificationResponseDto;
import com.feuji.healthcare.notification.enums.NotificationType;

import java.util.List;

public interface NotificationService {

    void createNotification(
            String title,
            String message,
            NotificationType type);

    List<NotificationResponseDto> getAllNotifications();
}
