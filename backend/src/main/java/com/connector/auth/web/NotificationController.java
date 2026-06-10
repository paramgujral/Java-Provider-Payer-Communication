package com.connector.auth.web;

import com.connector.auth.domain.Notification;
import com.connector.auth.service.NotificationService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService service;

    public NotificationController(NotificationService service) { this.service = service; }

    /** recipient = PROVIDER | PAYER */
    @GetMapping
    public List<Notification> list(@RequestParam String recipient) {
        return service.forRecipient(recipient);
    }

    @GetMapping("/unread-count")
    public Map<String, Long> unread(@RequestParam String recipient) {
        return Map.of("count", service.unread(recipient));
    }

    @PostMapping("/{id}/read")
    public Notification read(@PathVariable Long id) {
        return service.markRead(id);
    }

    @PostMapping("/read-all")
    public Map<String, String> readAll(@RequestParam String recipient) {
        service.markAllRead(recipient);
        return Map.of("status", "ok");
    }
}
