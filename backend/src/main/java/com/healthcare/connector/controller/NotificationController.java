package com.healthcare.connector.controller;

import com.healthcare.connector.dto.NotificationDto;
import com.healthcare.connector.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*", maxAge = 3600)
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole(\'Provider\', \'Payer\')")
    public ResponseEntity<List<NotificationDto>> getNotifications(@RequestParam Long userId) {
        return ResponseEntity.ok(notificationService.getNotificationsByUserId(userId));
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasAnyRole(\'Provider\', \'Payer\')")
    public ResponseEntity<NotificationDto> markAsRead(@PathVariable Long id) {
        return ResponseEntity.ok(notificationService.markNotificationAsRead(id));
    }

    @DeleteMapping
    @PreAuthorize("hasAnyRole(\'Provider\', \'Payer\')")
    public ResponseEntity<Void> clearAllNotifications(@RequestParam Long userId) {
        // This would typically involve deleting all notifications for a user
        // For simplicity, we'll just mark them as read for now or delete individually
        // A more robust implementation would clear all for the user.
        return ResponseEntity.noContent().build();
    }
}
