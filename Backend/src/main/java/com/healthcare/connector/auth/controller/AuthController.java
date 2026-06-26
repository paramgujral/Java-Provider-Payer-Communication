package com.healthcare.connector.auth.controller;

import com.healthcare.connector.auth.dto.AuthDTO;
import com.healthcare.connector.auth.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication")
public class AuthController {

    private final UserService userService;

    @PostMapping("/register")
    @Operation(summary = "Register provider or payer")
    public ResponseEntity<AuthDTO.AuthResponse> register(@RequestBody AuthDTO.RegisterRequest req) {
        return ResponseEntity.ok(userService.register(req));
    }

    @PostMapping("/login")
    @Operation(summary = "Login")
    public ResponseEntity<AuthDTO.AuthResponse> login(@RequestBody AuthDTO.LoginRequest req) {
        return ResponseEntity.ok(userService.login(req));
    }

}
