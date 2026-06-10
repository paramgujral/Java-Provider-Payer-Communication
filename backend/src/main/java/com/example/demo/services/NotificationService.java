package com.example.demo.services;


import com.example.demo.model.Notification;
import com.example.demo.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;



    // Called internally after payer approves/rejects
    public void sendNotification(Long providerId, Long requestId, String message) {
        Notification notification = Notification.builder()
                .providerId(providerId)
                .requestId(requestId)
                .message(message)
                .isRead(false)
                .build();
        notificationRepository.save(notification);
        log.info("Notification sent to provider {}: {}", providerId, message);
    }

    // GET /api/notifications/{providerId}
    public List<Notification> getNotifications(Long providerId) {
        return notificationRepository.findByProviderIdOrderByCreatedAtDesc(providerId);
    }

    // GET /api/notifications/{providerId}/unread-count
    public Map<String, Long> getUnreadCount(Long providerId) {
        long count = notificationRepository.countByProviderIdAndIsReadFalse(providerId);
        return Map.of("unreadCount", count);
    }

    // PUT /api/notifications/{providerId}/read-all
    public void markAllAsRead(Long providerId) {
        List<Notification> unread = notificationRepository.findByProviderIdAndIsReadFalse(providerId);
        unread.forEach(n -> n.setIsRead(true));
        notificationRepository.saveAll(unread);
        log.info("Marked {} notifications as read for provider {}", unread.size(), providerId);
    }
}
