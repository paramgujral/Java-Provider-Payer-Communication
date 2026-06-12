package com.healthcare.connector.service;

import com.healthcare.connector.model.Notification;
import com.healthcare.connector.model.User;
import com.healthcare.connector.repository.NotificationRepository;
import com.healthcare.connector.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    public List<Map<String, Object>> getNotifications(String username) {
        User user = findUser(username);
        return notificationRepository.findByUserOrderByCreatedAtDesc(user)
                .stream().map(this::mapNotification).toList();
    }

    public long getUnreadCount(String username) {
        User user = findUser(username);
        return notificationRepository.countByUserAndIsReadFalse(user);
    }

    @Transactional
    public void markAllRead(String username) {
        User user = findUser(username);
        List<Notification> unread = notificationRepository.findByUserAndIsReadFalse(user);
        unread.forEach(n -> {
            n.setIsRead(true);
            n.setReadAt(LocalDateTime.now());
        });
        notificationRepository.saveAll(unread);
    }

    @Transactional
    public void markRead(Long id, String username) {
        notificationRepository.findById(id).ifPresent(n -> {
            if (n.getUser().getUsername().equals(username)) {
                n.setIsRead(true);
                n.setReadAt(LocalDateTime.now());
                notificationRepository.save(n);
            }
        });
    }

    private User findUser(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
    }

    private Map<String, Object> mapNotification(Notification n) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", n.getId());
        map.put("title", n.getTitle());
        map.put("message", n.getMessage());
        map.put("type", n.getType().name());
        map.put("relatedCaseId", n.getRelatedCaseId());
        map.put("isRead", n.getIsRead());
        map.put("createdAt", n.getCreatedAt() != null ? n.getCreatedAt().toString() : null);
        return map;
    }
}
