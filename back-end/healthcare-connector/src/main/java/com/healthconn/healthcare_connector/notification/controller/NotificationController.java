package com.healthconn.healthcare_connector.notification.controller;

import com.healthconn.healthcare_connector.authentication.entity.User;
import com.healthconn.healthcare_connector.notification.dto.NotificationDto;
import com.healthconn.healthcare_connector.notification.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Tag(name = "Notification APIs")
public class NotificationController {

    private final NotificationService notificationService;

    @Operation(summary = "Get notifications for logged-in user")
    @GetMapping
    public ResponseEntity<List<NotificationDto>> getMyNotifications(
            @AuthenticationPrincipal User currentUser) {

        return ResponseEntity.ok(
                notificationService.getNotificationsForUser(
                        currentUser.getId()
                )
        );
    }

    @Operation(summary = "Get unread notification count")
    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(
            @AuthenticationPrincipal User currentUser) {

        return ResponseEntity.ok(
                Map.of(
                        "count",
                        notificationService.getUnreadCount(
                                currentUser.getId()
                        )
                )
        );
    }

    @Operation(summary = "Mark all notifications as read")
    @PutMapping("/mark-all-read")
    public ResponseEntity<Void> markAllRead(
            @AuthenticationPrincipal User currentUser) {

        notificationService.markAllRead(currentUser.getId());

        return ResponseEntity.ok().build();
    }

}