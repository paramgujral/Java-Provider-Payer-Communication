package com.healthconnect.provider.web;

import com.healthconnect.provider.domain.Notification;
import com.healthconnect.provider.repository.NotificationRepository;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationRepository notifications;

    public NotificationController(NotificationRepository notifications) {
        this.notifications = notifications;
    }

    @GetMapping
    public List<Notification> list(@RequestParam(defaultValue = "false") boolean unreadOnly) {
        return unreadOnly ? notifications.findByReadFalseOrderByCreatedAtDesc()
                : notifications.findAllByOrderByCreatedAtDesc();
    }

    @GetMapping("/unread-count")
    public Map<String, Long> unreadCount() {
        return Map.of("unread", notifications.countByReadFalse());
    }

    @PostMapping("/{id}/read")
    @Transactional
    public void markRead(@PathVariable Long id) {
        notifications.findById(id).ifPresent(n -> n.setRead(true));
    }

    @PostMapping("/read-all")
    @Transactional
    public void markAllRead() {
        notifications.findByReadFalseOrderByCreatedAtDesc().forEach(n -> n.setRead(true));
    }
}
