package com.healthcare.controller;

import com.healthcare.dto.RegisterRequest;
import com.healthcare.dto.UserDto;
import com.healthcare.entity.User;
import com.healthcare.repository.UserRepository;
import com.healthcare.security.CustomUserDetails;
import com.healthcare.service.EmailService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/organization/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('PROVIDER') or hasRole('PAYER')")
public class OrganizationUserController {

    private final UserRepository userRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;

    @GetMapping
    public ResponseEntity<List<UserDto>> getOrganizationUsers(@AuthenticationPrincipal CustomUserDetails userDetails) {
        if (!userDetails.isOrgAdmin()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        List<UserDto> users = userRepository.findByOrganizationId(userDetails.getOrganizationId()).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(users);
    }

    @PostMapping
    public ResponseEntity<?> createOrganizationUser(
            @Valid @RequestBody RegisterRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        
        if (!userDetails.isOrgAdmin()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only Organization Admins can add new users.");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Error: Email is already in use!");
        }

        String resetToken = UUID.randomUUID().toString();
        Date expiryDate = new Date(System.currentTimeMillis() + 86400000); // 24 hours

        // Fetch current user details to get the role string exactly as it exists
        User adminUser = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Admin user not found"));

        User newUser = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(UUID.randomUUID().toString()))
                .role(adminUser.getRole()) // inherit same role (PROVIDER or PAYER)
                .organizationId(userDetails.getOrganizationId()) // force same org ID
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .active(true) // auto-active since an admin created them
                .orgAdmin(false) // default to false
                .passwordResetToken(resetToken)
                .passwordResetTokenExpiry(expiryDate)
                .build();

        userRepository.save(newUser);

        String resetLink = "http://localhost:4200/reset-password?token=" + resetToken;
        String subject = "Welcome to HealthConnect - Account Created";
        String body = String.format("Hello %s,<br><br>Your organization administrator has created an account for you on HealthConnect.<br><br>" +
                "Please click the link below to set your password and log in:<br>" +
                "<a href=\"%s\">%s</a><br><br>This link will expire in 24 hours.<br><br>Thank you.", 
                newUser.getFirstName(), resetLink, resetLink);
        
        emailService.sendEmail(newUser.getEmail(), subject, body);

        return ResponseEntity.status(HttpStatus.CREATED).body(mapToDto(newUser));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> toggleUserStatus(
            @PathVariable String id, 
            @RequestParam boolean active,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        
        if (!userDetails.isOrgAdmin()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only Organization Admins can manage users.");
        }

        User targetUser = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!targetUser.getOrganizationId().equals(userDetails.getOrganizationId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Cannot modify users from another organization.");
        }
        
        // Prevent deactivating oneself
        if (targetUser.getEmail().equals(userDetails.getUsername())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Cannot deactivate your own account.");
        }

        targetUser.setActive(active);
        userRepository.save(targetUser);
        
        return ResponseEntity.ok(mapToDto(targetUser));
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
