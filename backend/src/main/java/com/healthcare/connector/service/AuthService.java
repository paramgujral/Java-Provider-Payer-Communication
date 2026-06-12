package com.healthcare.connector.service;

import com.healthcare.connector.model.User;
import com.healthcare.connector.repository.UserRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public User register(String username, String password, String email,
                         String fullName, String role, String organization, String npiNumber) {
        if (userRepository.existsByUsername(username)) {
            throw new RuntimeException("Username already taken: " + username);
        }
        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("Email already in use: " + email);
        }

        User user = new User();
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(password));
        user.setEmail(email);
        user.setFullName(fullName);
        user.setRole(User.UserRole.valueOf(role.toUpperCase()));
        user.setOrganization(organization);
        user.setNpiNumber(npiNumber);
        user.setActive(true);
        return userRepository.save(user);
    }

    public void updateLastLogin(String username) {
        userRepository.findByUsername(username).ifPresent(user -> {
            user.setLastLogin(LocalDateTime.now());
            userRepository.save(user);
        });
    }

    @PostConstruct
    public void seedDemoData() {
        if (userRepository.count() == 0) {
            createUser("provider1", "password123", "provider1@health.com",
                    "Dr. Sarah Johnson", User.UserRole.PROVIDER, "City Medical Center", "1234567890");
            createUser("provider2", "password123", "provider2@health.com",
                    "Dr. Michael Chen", User.UserRole.PROVIDER, "General Hospital", "0987654321");
            createUser("payer1", "password123", "payer1@insurance.com",
                    "Emily Davis", User.UserRole.PAYER, "BlueCross Insurance", null);
            createUser("admin", "admin123", "admin@healthconnect.com",
                    "System Admin", User.UserRole.ADMIN, "HealthConnectAI", null);
        }
    }

    private void createUser(String username, String password, String email,
                             String fullName, User.UserRole role, String org, String npi) {
        User user = new User();
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(password));
        user.setEmail(email);
        user.setFullName(fullName);
        user.setRole(role);
        user.setOrganization(org);
        user.setNpiNumber(npi);
        user.setActive(true);
        userRepository.save(user);
    }
}
