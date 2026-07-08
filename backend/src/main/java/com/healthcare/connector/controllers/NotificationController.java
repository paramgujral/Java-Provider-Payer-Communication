package com.healthcare.connector.controllers;


import com.healthcare.connector.Utils.SecurityUtils;
import com.healthcare.connector.models.Notification;
import com.healthcare.connector.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public ResponseEntity<List<Notification>> getUnread() {
        String email = SecurityUtils.getCurrentUsername() + "@example.com"; // In real app, fetch email from DB
        return ResponseEntity.ok(notificationService.getUnreadNotifications(email));
    }
}
