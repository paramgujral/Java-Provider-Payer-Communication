package ai.authbridge.web;

import ai.authbridge.domain.Enums.Role;
import ai.authbridge.notification.NotificationService;
import java.util.Map;
import org.springframework.web.bind.annotation.*;

/** Notifications API for the in-app notification center. */
@RestController
@RequestMapping("/api/v1/notifications")
public class NotificationController {

    private final NotificationService service;

    public NotificationController(NotificationService service) { this.service = service; }

    @GetMapping
    public Map<String, Object> list(@RequestParam Role role) {
        return Map.of("data", service.list(role), "unread", service.unread(role));
    }

    @PostMapping
    public Map<String, Object> markAllRead(@RequestBody Map<String, String> body) {
        Role role = Role.valueOf(body.get("role"));
        if ("markAllRead".equals(body.get("action"))) service.markAllRead(role);
        return Map.of("data", service.list(role), "unread", service.unread(role));
    }
}
