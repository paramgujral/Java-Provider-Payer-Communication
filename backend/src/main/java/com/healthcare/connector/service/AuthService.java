package com.healthcare.connector.service;


import com.healthcare.connector.Dto.RegisterRequest;
import com.healthcare.connector.Utils.SecurityUtils;
import com.healthcare.connector.enums.Role;
import com.healthcare.connector.models.User;
import com.healthcare.connector.repositories.UserRepository;
import com.healthcare.connector.securityconfiguration.JwtUtil;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;

    public AuthService(AuthenticationManager authenticationManager,
                       UserRepository userRepository,
                       JwtUtil jwtUtil, PasswordEncoder passwordEncoder) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
        this.passwordEncoder = passwordEncoder;
    }

    public void registerUser(RegisterRequest request) {
        // 1. Check if username already exists
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new RuntimeException("Username already taken");
        }

        // 2. Validate role
        Role role;
        try {
            role = Role.valueOf(request.getRole().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid role: must be PROVIDER or PAYER");
        }

        // 3. (Optional) Validate that the entity ID exists in the respective table
        // For simplicity, we skip this check, but you can add it.

        // 4. Create user
        User user = new User();
        user.setUsername(request.getUsername());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole(role);
        if (role == Role.PROVIDER) {
            user.setProviderId(request.getEntityId());
        } else {
            user.setPayerId(request.getEntityId());
        }

        userRepository.save(user);
    }

    public LoginResponse authenticateAndGenerateToken(String username, String password) throws AuthenticationException {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(username, password)
        );

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String token = jwtUtil.generateToken(
                user.getUsername(),
                user.getRole().name(),
                user.getEntityId()
        );

        return new LoginResponse(token, user.getRole().name());
    }

    public User getCurrentUser() {
        String username = SecurityUtils.getCurrentUsername();
        if (username == null) {
            throw new RuntimeException("No authenticated user found");
        }
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Current user not found"));
    }

    // Inner DTO for login response
    public static class LoginResponse {
        private final String token;
        private final String role;

        public LoginResponse(String token, String role) {
            this.token = token;
            this.role = role;
        }

        public String getToken() { return token; }
        public String getRole() { return role; }
    }
}