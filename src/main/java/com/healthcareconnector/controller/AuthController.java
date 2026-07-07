package com.healthcareconnector.controller;

import com.healthcareconnector.dto.LoginRequest;
import com.healthcareconnector.model.User;
import com.healthcareconnector.service.DataStore;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class AuthController {

    private final DataStore dataStore;

    public AuthController(DataStore dataStore) {
        this.dataStore = dataStore;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        User user = dataStore.getDatabase().getUsers().stream()
                .filter(u -> u.getUsername().equals(loginRequest.getUsername())
                        && u.getPassword().equals(loginRequest.getPassword()))
                .findFirst()
                .orElse(null);

        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid username or password."));
        }
        return ResponseEntity.ok(user.toSafeUser());
    }
}
