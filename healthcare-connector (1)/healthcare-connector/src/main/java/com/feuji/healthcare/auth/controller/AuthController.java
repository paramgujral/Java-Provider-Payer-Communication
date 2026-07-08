package com.feuji.healthcare.auth.controller;

import com.feuji.healthcare.auth.dto.LoginRequestDto;
import com.feuji.healthcare.auth.dto.LoginResponseDto;
import com.feuji.healthcare.auth.dto.RegisterRequestDto;
import com.feuji.healthcare.auth.service.AuthService;
import com.feuji.healthcare.common.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<String>> register(
            @RequestBody RegisterRequestDto request) {

        authService.register(request);

        return ResponseEntity.ok(
                ApiResponse.<String>builder()
                        .success(true)
                        .message("User registered successfully")
                        .data(null)
                        .build()
        );
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponseDto>> login(
            @RequestBody LoginRequestDto request) {

        LoginResponseDto response =
                authService.login(request);

        return ResponseEntity.ok(
                ApiResponse.<LoginResponseDto>builder()
                        .success(true)
                        .message("Login successful")
                        .data(response)
                        .build()
        );
    }
}