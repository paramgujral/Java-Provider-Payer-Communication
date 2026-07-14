package com.healthcare.notification.controller;

import com.healthcare.notification.entity.Notification;
import com.healthcare.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/notification")
@RequiredArgsConstructor
public class NotificationController {
    private final NotificationService service;

    @PostMapping("/send")
    @PreAuthorize("hasAnyRole('PROVIDER','PAYER','ADMIN')")
    public Notification send(@RequestBody Notification notification) {
        return service.send(notification);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('PROVIDER','PAYER','ADMIN')")
    public Notification getById(@PathVariable Long id) {
        return service.getById(id);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('PROVIDER','PAYER','ADMIN')")
    public List<Notification> getAll() {
        return service.getAll();
    }
}
