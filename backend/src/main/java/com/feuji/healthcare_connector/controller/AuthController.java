package com.feuji.healthcare_connector.controller;

import com.feuji.healthcare_connector.dto.request.*;
import com.feuji.healthcare_connector.dto.response.ApiResponse;
import com.feuji.healthcare_connector.dto.response.AuthResponse;
import com.feuji.healthcare_connector.service.AuthService;
import com.feuji.healthcare_connector.service.RedisService;
import com.feuji.healthcare_connector.exception.BadRequestException;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private RedisService redisService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<String>> register(@Valid @RequestBody RegisterRequest request) {
        if (redisService.isRateLimited("rate:register:" + request.getEmail(), 3, 60)) {
            throw new BadRequestException("Too many registration requests. Please try again after 60 seconds.");
        }
        authService.register(request);
        return ResponseEntity.ok(new ApiResponse<>(true, "Registration successful. Please verify your email with the OTP sent."));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<ApiResponse<AuthResponse>> verifyOtp(@Valid @RequestBody OtpVerificationRequest request) {
        AuthResponse response = authService.verifyOtp(request);
        return ResponseEntity.ok(new ApiResponse<>(true, "Email verification successful.", response));
    }

    @PostMapping("/resend-otp")
    public ResponseEntity<ApiResponse<String>> resendOtp(@RequestParam String email) {
        if (redisService.isRateLimited("rate:resend:" + email, 3, 60)) {
            throw new BadRequestException("Too many OTP requests. Please try again after 60 seconds.");
        }
        authService.resendOtp(email);
        return ResponseEntity.ok(new ApiResponse<>(true, "A new OTP code has been sent to your email."));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        if (redisService.isRateLimited("rate:login:" + request.getEmail(), 5, 60)) {
            throw new BadRequestException("Too many login attempts. Please try again after 60 seconds.");
        }
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(new ApiResponse<>(true, "Login successful.", response));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<String>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        if (redisService.isRateLimited("rate:forgot:" + request.getEmail(), 3, 60)) {
            throw new BadRequestException("Too many reset attempts. Please try again after 60 seconds.");
        }
        authService.forgotPassword(request.getEmail());
        return ResponseEntity.ok(new ApiResponse<>(true, "If the email is registered, a password reset link has been sent."));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<String>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ResponseEntity.ok(new ApiResponse<>(true, "Password has been reset successfully. You can now login."));
    }
}
