package com.example.demo.controller;


import com.example.demo.model.Notification;
import com.example.demo.services.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class NotificationController {

    private final NotificationService notificationService;

    /**
     * GET /api/notifications/{providerId}
     * Returns all notifications for a provider, newest first.
     */
    @GetMapping("/{providerId}")
    public ResponseEntity<List<Notification>> getNotifications(@PathVariable Long providerId) {
        return ResponseEntity.ok(notificationService.getNotifications(providerId));
    }

    /**
     * GET /api/notifications/{providerId}/unread-count
     * Returns { "unreadCount": N } — used for the bell badge in the UI.
     */
    @GetMapping("/{providerId}/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(@PathVariable Long providerId) {
        return ResponseEntity.ok(notificationService.getUnreadCount(providerId));
    }

    /**
     * PUT /api/notifications/{providerId}/read-all
     * Marks all notifications as read for this provider.
     */
    @PutMapping("/{providerId}/read-all")
    public ResponseEntity<Void> markAllAsRead(@PathVariable Long providerId) {
        notificationService.markAllAsRead(providerId);
        return ResponseEntity.ok().build();
    }
}
