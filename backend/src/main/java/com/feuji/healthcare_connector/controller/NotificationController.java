package com.feuji.healthcare_connector.controller;

import com.feuji.healthcare_connector.dto.response.ApiResponse;
import com.feuji.healthcare_connector.entity.Notification;
import com.feuji.healthcare_connector.entity.User;
import com.feuji.healthcare_connector.exception.ResourceNotFoundException;
import com.feuji.healthcare_connector.exception.UnauthorizedException;
import com.feuji.healthcare_connector.repository.UserRepository;
import com.feuji.healthcare_connector.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<NotificationResponse>>> getNotifications(Principal principal) {
        User user = getAuthenticatedUser(principal);
        List<Notification> list = notificationService.getNotificationsForUser(user);
        List<NotificationResponse> response = list.stream()
                .map(NotificationResponse::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(new ApiResponse<>(true, "Notifications retrieved successfully", response));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<Long>> getUnreadCount(Principal principal) {
        User user = getAuthenticatedUser(principal);
        long count = notificationService.getUnreadCount(user);
        return ResponseEntity.ok(new ApiResponse<>(true, "Unread count retrieved successfully", count));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<ApiResponse<String>> markAsRead(@PathVariable Long id, Principal principal) {
        getAuthenticatedUser(principal); // verify authentication
        notificationService.markAsRead(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Notification marked as read."));
    }

    @PutMapping("/read-all")
    public ResponseEntity<ApiResponse<String>> markAllAsRead(Principal principal) {
        User user = getAuthenticatedUser(principal);
        notificationService.markAllAsRead(user);
        return ResponseEntity.ok(new ApiResponse<>(true, "All notifications marked as read."));
    }

    private User getAuthenticatedUser(Principal principal) {
        if (principal == null) {
            throw new UnauthorizedException("User is not authenticated.");
        }
        return userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + principal.getName()));
    }

    public static class NotificationResponse {
        private Long id;
        private Long requestId;
        private String title;
        private String message;
        private String type;
        private Boolean isRead;
        private String createdAt;

        public NotificationResponse(Notification notif) {
            this.id = notif.getId();
            if (notif.getRequest() != null) {
                this.requestId = notif.getRequest().getId();
            }
            this.title = notif.getTitle();
            this.message = notif.getMessage();
            this.type = notif.getType().name();
            this.isRead = notif.getIsRead();
            this.createdAt = notif.getCreatedAt().toString();
        }

        public Long getId() { return id; }
        public Long getRequestId() { return requestId; }
        public String getTitle() { return title; }
        public String getMessage() { return message; }
        public String getType() { return type; }
        public Boolean getIsRead() { return isRead; }
        public String getCreatedAt() { return createdAt; }
    }
}
