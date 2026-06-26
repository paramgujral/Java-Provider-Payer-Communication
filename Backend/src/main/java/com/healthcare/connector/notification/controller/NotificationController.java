package com.healthcare.connector.notification.controller;

import com.healthcare.connector.auth.entity.User;
import com.healthcare.connector.notification.dto.NotificationDTO;
import com.healthcare.connector.notification.entity.Notification;
import com.healthcare.connector.notification.service.NotificationService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Tag(name = "Notifications")
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<Page<NotificationDTO.NotificationResponse>> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @AuthenticationPrincipal User user) {
        PageRequest pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(
                notificationService.getNotificationsForUser(user, pageable).map(this::toResponse)
        );
    }

    @GetMapping("/unread")
    public ResponseEntity<List<NotificationDTO.NotificationResponse>> unread(
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(
                notificationService.getUnreadNotifications(user)
                        .stream().map(this::toResponse).collect(Collectors.toList())
        );
    }

    @GetMapping("/unread/count")
    public ResponseEntity<Map<String, Long>> unreadCount(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(Map.of("count", notificationService.getUnreadCount(user)));
    }

    @PostMapping("/mark-all-read")
    public ResponseEntity<Void> markAllRead(@AuthenticationPrincipal User user) {
        notificationService.markAllAsRead(user);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/read")
    public ResponseEntity<Void> markRead(@PathVariable Long id, @AuthenticationPrincipal User user) {
        notificationService.markAsRead(id, user);
        return ResponseEntity.ok().build();
    }

    private NotificationDTO.NotificationResponse toResponse(Notification n) {
        return NotificationDTO.NotificationResponse.builder()
                .id(n.getId())
                .title(n.getTitle())
                .message(n.getMessage())
                .type(n.getType())
                .referenceNumber(n.getReferenceNumber())
                .authRequestId(n.getAuthRequestId())
                .read(n.isRead())
                .readAt(n.getReadAt())
                .createdAt(n.getCreatedAt())
                .recipientUsername(n.getRecipient() != null ? n.getRecipient().getUsername() : null)
                .build();
    }
}
