package com.healthconnector.dto;

import com.healthconnector.model.UserRole;

public class LoginDtos {

    public static class LoginRequest {
        private String username;
        private String password;

        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }

        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }

    public static class LoginResponse {
        private String username;
        private UserRole role;
        private String token;

        public LoginResponse(String username, UserRole role, String token) {
            this.username = username;
            this.role = role;
            this.token = token;
        }

        public String getUsername() { return username; }
        public UserRole getRole() { return role; }
        public String getToken() { return token; }
    }
}
