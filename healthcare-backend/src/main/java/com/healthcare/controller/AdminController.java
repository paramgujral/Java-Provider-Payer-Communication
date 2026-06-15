package com.healthcare.controller;

import com.healthcare.dto.UserDto;
import com.healthcare.entity.User;
import com.healthcare.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.Date;
import java.util.stream.Collectors;
import com.healthcare.dto.RegisterRequest;
import jakarta.validation.Valid;
import org.springframework.security.crypto.password.PasswordEncoder;

@RestController
@RequestMapping("/api/v1/admin/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final UserRepository userRepository;
    private final com.healthcare.service.EmailService emailService;
    private final PasswordEncoder passwordEncoder;

    @GetMapping
    public ResponseEntity<List<UserDto>> getAllUsers() {
        List<UserDto> users = userRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(users);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<UserDto> toggleUserStatus(@PathVariable String id, @RequestParam boolean active) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found: " + id));
        
        boolean wasInactive = !user.isActive();
        user.setActive(active);
        userRepository.save(user);
        
        // If user was just activated, send an email
        if (active && wasInactive) {
            String subject = "Your HealthConnect Account is Approved!";
            String body = String.format("Hello %s,<br><br>Your registration has been approved by the system administrator. You can now log in to the HealthConnect platform.<br><br>Thank you.", user.getFirstName());
            emailService.sendEmail(user.getEmail(), subject, body);
        }
        
        return ResponseEntity.ok(mapToDto(user));
    }

    @PostMapping
    public ResponseEntity<UserDto> createUser(@Valid @RequestBody RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Error: Email is already in use!");
        }

        String resetToken = UUID.randomUUID().toString();
        // 24 hour expiry
        Date expiryDate = new Date(System.currentTimeMillis() + 86400000);

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(UUID.randomUUID().toString())) // Random unguessable password
                .role(request.getRole().toUpperCase())
                .organizationId(request.getOrganizationId())
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .addressLine1(request.getAddressLine1())
                .addressLine2(request.getAddressLine2())
                .city(request.getCity())
                .state(request.getState())
                .zipCode(request.getZipCode())
                .active(true)
                .passwordResetToken(resetToken)
                .passwordResetTokenExpiry(expiryDate)
                .build();

        userRepository.save(user);

        String resetLink = "http://localhost:4200/reset-password?token=" + resetToken;
        String subject = "Welcome to HealthConnect - Account Created";
        String body = String.format("Hello %s,<br><br>An administrator has created an account for you on HealthConnect.<br><br>" +
                "Please click the link below to set your password and log in:<br>" +
                "<a href=\"%s\">%s</a><br><br>This link will expire in 24 hours.<br><br>Thank you.", 
                user.getFirstName(), resetLink, resetLink);
        
        emailService.sendEmail(user.getEmail(), subject, body);

        return ResponseEntity.ok(mapToDto(user));
    }

    private UserDto mapToDto(User user) {
        return UserDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .role(user.getRole())
                .organizationId(user.getOrganizationId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .active(user.isActive())
                .build();
    }
}
