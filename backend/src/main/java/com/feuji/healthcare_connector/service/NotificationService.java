package com.feuji.healthcare_connector.service;

import com.feuji.healthcare_connector.entity.AuthorizationRequest;
import com.feuji.healthcare_connector.entity.Notification;
import com.feuji.healthcare_connector.entity.User;
import com.feuji.healthcare_connector.enums.NotificationType;
import com.feuji.healthcare_connector.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private EmailService emailService;

    @Transactional
    public Notification createNotification(User user, AuthorizationRequest request, String title, String message, NotificationType type) {
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setRequest(request);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setType(type);
        notification.setIsRead(false);
        
        Notification savedNotification = notificationRepository.save(notification);

        // Send Email notification asynchronously
        String requestUrl = "";
        if (request != null) {
            String rolePath = user.getRole().name().toLowerCase();
            requestUrl = "http://localhost:4200/" + rolePath + "/requests/" + request.getId();
        }
        
        try {
            emailService.sendNotificationEmail(user.getEmail(), title, title, message, requestUrl);
        } catch (Exception e) {
            System.err.println("Could not send notification email: " + e.getMessage());
        }

        return savedNotification;
    }

    public List<Notification> getNotificationsForUser(User user) {
        return notificationRepository.findByUserOrderByCreatedAtDesc(user);
    }

    public long getUnreadCount(User user) {
        return notificationRepository.countByUserAndIsReadFalse(user);
    }

    @Transactional
    public void markAsRead(Long id) {
        notificationRepository.findById(id).ifPresent(notification -> {
            notification.setIsRead(true);
            notificationRepository.save(notification);
        });
    }

    @Transactional
    public void markAllAsRead(User user) {
        List<Notification> notifications = notificationRepository.findByUserOrderByCreatedAtDesc(user);
        for (Notification notification : notifications) {
            if (!notification.getIsRead()) {
                notification.setIsRead(true);
                notificationRepository.save(notification);
            }
        }
    }
}
