package com.healthconnector.service;

import com.healthconnector.model.AppNotification;
import com.healthconnector.model.UserRole;
import com.healthconnector.repository.AppNotificationRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationService {

    private final AppNotificationRepository notificationRepository;

    public NotificationService(AppNotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    public void notifyRole(UserRole role, String message, Long requestId) {
        AppNotification n = new AppNotification();
        n.setRecipientRole(role);
        n.setMessage(message);
        n.setRequestId(requestId);
        notificationRepository.save(n);
    }

    public void notifyUser(String username, UserRole role, String message, Long requestId) {
        AppNotification n = new AppNotification();
        n.setRecipientUsername(username);
        n.setRecipientRole(role);
        n.setMessage(message);
        n.setRequestId(requestId);
        notificationRepository.save(n);
    }

    public List<AppNotification> forRole(UserRole role) {
        return notificationRepository.findByRecipientRoleOrderByCreatedAtDesc(role);
    }

    public List<AppNotification> forUser(String username) {
        return notificationRepository.findByRecipientUsernameOrderByCreatedAtDesc(username);
    }

    public void markRead(Long id) {
        notificationRepository.findById(id).ifPresent(n -> {
            n.setRead(true);
            notificationRepository.save(n);
        });
    }
}
