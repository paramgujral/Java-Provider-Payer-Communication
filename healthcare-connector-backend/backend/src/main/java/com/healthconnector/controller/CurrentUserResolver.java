package com.healthconnector.controller;

import com.healthconnector.service.AuthService;
import org.springframework.stereotype.Component;

@Component
public class CurrentUserResolver {

    private final AuthService authService;

    public CurrentUserResolver(AuthService authService) {
        this.authService = authService;
    }

    public String usernameFromHeader(String authorizationHeader) {
        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            throw new IllegalArgumentException("Missing or invalid Authorization header");
        }
        String token = authorizationHeader.substring("Bearer ".length());
        String username = authService.usernameForToken(token);
        if (username == null) {
            throw new IllegalArgumentException("Invalid or expired token");
        }
        return username;
    }
}
