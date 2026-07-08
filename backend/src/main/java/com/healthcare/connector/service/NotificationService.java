package com.healthcare.connector.service;

import com.healthcare.connector.models.AuthorizationRequest;
import com.healthcare.connector.models.Notification;
import com.healthcare.connector.repositories.NotificationRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    public void sendNotification(AuthorizationRequest request, String message) {
        Notification notification = new Notification();
        notification.setRequest(request);
        notification.setRecipientEmail(request.getProvider().getEmail());
        notification.setMessage(message);
        notification.setIsRead(false);
        notificationRepository.save(notification);
    }

    public List<Notification> getUnreadNotifications(String email) {
        return notificationRepository.findByRecipientEmailAndIsReadFalse(email);
    }
}
