package com.healthconnect.service;

import com.healthconnect.model.Notification;
import com.healthconnect.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    public Notification create(Long recipientUserId, String message, String authFhirId) {
        Notification n = new Notification();
        n.setRecipientUserId(recipientUserId);
        n.setMessage(message);
        n.setAuthorizationFhirId(authFhirId);
        n.setIsRead(false);
        return notificationRepository.save(n);
    }

    public List<Notification> getForUser(Long userId) {
        return notificationRepository.findByRecipientUserIdOrderByCreatedAtDesc(userId);
    }

    public List<Notification> getUnreadForUser(Long userId) {
        return notificationRepository.findByRecipientUserIdAndIsReadFalseOrderByCreatedAtDesc(userId);
    }

    public Notification markRead(Long notificationId) {
        Notification n = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new IllegalArgumentException("Notification not found"));
        n.setIsRead(true);
        return notificationRepository.save(n);
    }

    public void markAllRead(Long userId) {
        List<Notification> unread = getUnreadForUser(userId);
        unread.forEach(n -> n.setIsRead(true));
        notificationRepository.saveAll(unread);
    }
}
