package com.healthconnect.dto;

import com.healthconnect.model.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

public class AuthDtos {

    @Data
    public static class RegisterRequest {
        @NotBlank
        private String username;

        @NotBlank
        private String password;

        @NotBlank
        private String fullName;

        @NotBlank
        private String organizationName;

        @NotBlank
        private String role; // "PROVIDER" or "PAYER" -- converted to UserRole enum in service

        @Email
        @NotBlank
        private String email;
    }

    @Data
    public static class LoginRequest {
        @NotBlank
        private String username;

        @NotBlank
        private String password;
    }

    @Data
    public static class JwtResponse {
        private String token;
        private String username;
        private String fullName;
        private String organizationName;
        private UserRole role;
        private Long userId;

        public JwtResponse(String token, Long userId, String username, String fullName, String organizationName, UserRole role) {
            this.token = token;
            this.userId = userId;
            this.username = username;
            this.fullName = fullName;
            this.organizationName = organizationName;
            this.role = role;
        }
    }
}
