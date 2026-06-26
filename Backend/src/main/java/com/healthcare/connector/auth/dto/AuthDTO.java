package com.healthcare.connector.auth.dto;

import com.healthcare.connector.auth.enums.UserRole;
import lombok.*;

public class AuthDTO {

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class LoginRequest {
        private String username;
        private String password;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class RegisterRequest {
        private String username;
        private String password;
        private String fullName;
        private String email;
        private UserRole role;
        private String organizationId;
        private String organizationName;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class AuthResponse {
        private String token;
        private String username;
        private String fullName;
        private String email;
        private UserRole role;
        private String organizationId;
        private String organizationName;
        private Long userId;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class UserResponse {
        private Long id;
        private String username;
        private String fullName;
        private String email;
        private UserRole role;
        private String organizationId;
        private String organizationName;
    }
}

