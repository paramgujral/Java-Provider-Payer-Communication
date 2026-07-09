package com.healthconnect.controller;

import com.healthconnect.config.CurrentUserProvider;
import com.healthconnect.model.Notification;
import com.healthconnect.model.User;
import com.healthconnect.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private CurrentUserProvider currentUserProvider;

    @GetMapping
    public ResponseEntity<List<Notification>> list(@RequestParam(required = false, defaultValue = "false") boolean unreadOnly) {
        User user = currentUserProvider.getCurrentUser();
        List<Notification> result = unreadOnly
                ? notificationService.getUnreadForUser(user.getId())
                : notificationService.getForUser(user.getId());
        return ResponseEntity.ok(result);
    }

    @PostMapping("/{id}/read")
    public ResponseEntity<?> markRead(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(notificationService.markRead(id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/read-all")
    public ResponseEntity<?> markAllRead() {
        User user = currentUserProvider.getCurrentUser();
        notificationService.markAllRead(user.getId());
        return ResponseEntity.ok(Map.of("message", "All notifications marked as read"));
    }
}
