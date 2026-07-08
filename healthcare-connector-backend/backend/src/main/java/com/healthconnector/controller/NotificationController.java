package com.healthconnector.controller;

import com.healthconnector.model.AppNotification;
import com.healthconnector.model.AppUser;
import com.healthconnector.repository.AppUserRepository;
import com.healthconnector.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;
    private final CurrentUserResolver currentUserResolver;
    private final AppUserRepository userRepository;

    public NotificationController(NotificationService notificationService,
                                   CurrentUserResolver currentUserResolver,
                                   AppUserRepository userRepository) {
        this.notificationService = notificationService;
        this.currentUserResolver = currentUserResolver;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<List<AppNotification>> list(@RequestHeader("Authorization") String authHeader) {
        String username = currentUserResolver.usernameFromHeader(authHeader);
        Optional<AppUser> user = userRepository.findByUsername(username);

        List<AppNotification> result = new ArrayList<>();
        result.addAll(notificationService.forUser(username));
        user.ifPresent(u -> result.addAll(notificationService.forRole(u.getRole())));
        return ResponseEntity.ok(result);
    }

    @PostMapping("/{id}/read")
    public ResponseEntity<Void> markRead(@PathVariable Long id) {
        notificationService.markRead(id);
        return ResponseEntity.ok().build();
    }
}
