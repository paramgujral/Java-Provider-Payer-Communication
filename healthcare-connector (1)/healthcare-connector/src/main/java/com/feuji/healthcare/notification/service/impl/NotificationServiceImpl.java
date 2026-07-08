package com.feuji.healthcare.notification.service.impl;

import com.feuji.healthcare.notification.dto.NotificationResponseDto;
import com.feuji.healthcare.notification.entity.NotificationEntity;
import com.feuji.healthcare.notification.enums.NotificationType;
import com.feuji.healthcare.notification.repository.NotificationRepository;
import com.feuji.healthcare.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl
        implements NotificationService {

    private final NotificationRepository notificationRepository;

    @Override
    public void createNotification(
            String title,
            String message,
            NotificationType type) {

        NotificationEntity notification =
                NotificationEntity.builder()
                        .title(title)
                        .message(message)
                        .notificationType(type)
                        .isRead(false)
                        .build();

        notificationRepository.save(notification);
    }

    @Override
    public List<NotificationResponseDto>
    getAllNotifications() {

        return notificationRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private NotificationResponseDto mapToResponse(
            NotificationEntity entity) {

        return NotificationResponseDto.builder()
                .id(entity.getId())
                .title(entity.getTitle())
                .message(entity.getMessage())
                .notificationType(
                        entity.getNotificationType())
                .isRead(entity.getIsRead())
                .build();
    }
}