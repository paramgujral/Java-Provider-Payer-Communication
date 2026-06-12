package com.healthcare.connector.controller;

import com.healthcare.connector.model.User;
import com.healthcare.connector.repository.UserRepository;
import com.healthcare.connector.security.JwtUtils;
import com.healthcare.connector.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "JWT auth endpoints")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private AuthService authService;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/login")
    @Operation(summary = "Login and get JWT token")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.get("username"), request.get("password")));
            SecurityContextHolder.getContext().setAuthentication(authentication);
            String token = jwtUtils.generateJwtToken(authentication);
            authService.updateLastLogin(request.get("username"));

            User user = userRepository.findByUsername(request.get("username")).orElseThrow();
            Map<String, Object> response = new LinkedHashMap<>();
            response.put("token", token);
            response.put("type", "Bearer");
            response.put("id", user.getId());
            response.put("username", user.getUsername());
            response.put("email", user.getEmail());
            response.put("role", user.getRole().name());
            response.put("fullName", user.getFullName());
            response.put("organization", user.getOrganization());
            return ResponseEntity.ok(response);
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid credentials"));
        }
    }

    @PostMapping("/register")
    @Operation(summary = "Register a new user")
    public ResponseEntity<?> register(@RequestBody Map<String, String> req) {
        try {
            User user = authService.register(
                    req.get("username"), req.get("password"), req.get("email"),
                    req.get("fullName"), req.get("role"),
                    req.get("organization"), req.get("npiNumber"));
            return ResponseEntity.ok(Map.of(
                    "message", "User registered successfully",
                    "username", user.getUsername(),
                    "role", user.getRole().name()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
