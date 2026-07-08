package com.healthcare.connector.controllers;


import com.healthcare.connector.Dto.LoginRequest;
import com.healthcare.connector.Dto.RegisterRequest;
import com.healthcare.connector.service.AuthService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * REST controller for authentication operations.
 * Only handles HTTP request/response – delegates business logic to AuthService.
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /**
     * Authenticates a user and returns a JWT token.
     *
     * @param request Login request containing username and password
     * @return JWT token with user role on success, or 401 Unauthorized on failure
     */

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            authService.registerUser(request);
            return ResponseEntity.ok(Map.of("message", "User registered successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        System.out.println("Request Successfully reached at login");
        try {
            // Delegate authentication logic to the service layer
            AuthService.LoginResponse response = authService.authenticateAndGenerateToken(
                    request.getUsername(),
                    request.getPassword()
            );
            return ResponseEntity.ok(response);
        } catch (AuthenticationException e) {
            // Spring Security throws this when credentials are invalid
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", "Invalid username or password");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
        } catch (RuntimeException e) {
            // Catch any other unexpected errors (e.g., user not found after auth)
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", "Authentication failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
}
