package com.healthcareconnector.controller;

import com.healthcareconnector.model.Notification;
import com.healthcareconnector.service.DataStore;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final DataStore dataStore;

    public NotificationController(DataStore dataStore) {
        this.dataStore = dataStore;
    }

    @GetMapping
    public ResponseEntity<?> listNotifications(@RequestParam String username) {
        List<Notification> results = dataStore.getDatabase().getNotifications().stream()
                .filter(n -> username.equals(n.getUsername()))
                .sorted(Comparator.comparing(Notification::getCreatedAt).reversed())
                .collect(Collectors.toList());
        return ResponseEntity.ok(results);
    }

    @PostMapping("/{id}/read")
    public ResponseEntity<?> markRead(@PathVariable String id) {
        Notification note = dataStore.getDatabase().getNotifications().stream()
                .filter(n -> n.getId().equals(id))
                .findFirst()
                .orElse(null);

        if (note == null) {
            return ResponseEntity.status(404).body(Map.of("error", "Notification not found."));
        }
        note.setRead(true);
        dataStore.save();
        return ResponseEntity.ok(note);
    }
}
