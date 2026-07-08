package com.healthconnector.service;

import com.healthconnector.model.AppUser;
import com.healthconnector.repository.AppUserRepository;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Minimal demo authentication: plain-text password check + random bearer
 * token kept in memory. This is intentionally simple for a project
 * skeleton - replace with Spring Security + JWT (or OAuth2) before any
 * real deployment, especially since this handles PHI-adjacent data.
 */
@Service
public class AuthService {

    private final AppUserRepository userRepository;
    private final Map<String, String> tokenToUsername = new ConcurrentHashMap<>();

    public AuthService(AppUserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public AppUser authenticate(String username, String password) {
        AppUser user = userRepository.findByUsername(username)
                .filter(u -> u.getPassword().equals(password))
                .orElseThrow(() -> new IllegalArgumentException("Invalid credentials"));
        return user;
    }

    public String issueToken(AppUser user) {
        String token = UUID.randomUUID().toString();
        tokenToUsername.put(token, user.getUsername());
        return token;
    }

    public String usernameForToken(String token) {
        return tokenToUsername.get(token);
    }
}
