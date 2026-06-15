package com.healthcare.controller;

import com.healthcare.entity.Notification;
import com.healthcare.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
@Tag(name = "Notification API", description = "Endpoints for managing in-app notifications")
public class NotificationController {

    private final NotificationService notificationService;

    @Operation(summary = "Get all notifications for a recipient (paginated)")
    @GetMapping("/{recipientId}")
    public ResponseEntity<Page<Notification>> getNotifications(
            @PathVariable String recipientId, Pageable pageable) {
        return ResponseEntity.ok(notificationService.getNotifications(recipientId, pageable));
    }

    @Operation(summary = "Get only unread notifications for a recipient")
    @GetMapping("/{recipientId}/unread")
    public ResponseEntity<List<Notification>> getUnreadNotifications(@PathVariable String recipientId) {
        return ResponseEntity.ok(notificationService.getUnreadNotifications(recipientId));
    }

    @Operation(summary = "Get unread notification count for a recipient")
    @GetMapping("/{recipientId}/unread/count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(@PathVariable String recipientId) {
        long count = notificationService.getUnreadCount(recipientId);
        return ResponseEntity.ok(Map.of("unreadCount", count));
    }

    @Operation(summary = "Mark a single notification as read")
    @PatchMapping("/{notificationId}/read")
    public ResponseEntity<Notification> markAsRead(@PathVariable String notificationId) {
        return ResponseEntity.ok(notificationService.markAsRead(notificationId));
    }

    @Operation(summary = "Mark all notifications as read for a recipient")
    @PatchMapping("/{recipientId}/read-all")
    public ResponseEntity<Void> markAllAsRead(@PathVariable String recipientId) {
        notificationService.markAllAsRead(recipientId);
        return ResponseEntity.noContent().build();
    }
}
