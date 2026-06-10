package com.healthconnect.platform.controller;

import com.healthconnect.platform.dto.request.LoginRequest;
import com.healthconnect.platform.dto.response.ApiResponse;
import com.healthconnect.platform.dto.response.AuthResponse;
import com.healthconnect.platform.entity.User;
import com.healthconnect.platform.security.JwtTokenProvider;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Login and token endpoints")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;

    @PostMapping("/login")
    @Operation(summary = "Authenticate and receive JWT token")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request) {

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        User user = (User) authentication.getPrincipal();

        String token = jwtTokenProvider.generateToken(user);

        AuthResponse response = AuthResponse.builder()
                .token(token)
                .type("Bearer")
                .userId(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .organization(user.getOrganization())
                .role(user.getRole())
                .build();

        return ResponseEntity.ok(
                ApiResponse.success("Login successful", response)
        );
    }

    @GetMapping("/me")
    @Operation(summary = "Get current authenticated user profile")
    public ResponseEntity<ApiResponse<AuthResponse>> getCurrentUser(
            @AuthenticationPrincipal User user) {

        AuthResponse response = AuthResponse.builder()
                .userId(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .organization(user.getOrganization())
                .role(user.getRole())
                .build();

        return ResponseEntity.ok(
                ApiResponse.success(response)
        );
    }
}