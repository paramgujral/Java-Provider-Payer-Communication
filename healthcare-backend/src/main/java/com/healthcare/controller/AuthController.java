package com.healthcare.controller;

import com.healthcare.dto.AuthRequest;
import com.healthcare.dto.AuthResponse;
import com.healthcare.dto.RegisterRequest;
import com.healthcare.dto.ResetPasswordRequest;
import com.healthcare.entity.User;
import com.healthcare.repository.UserRepository;
import com.healthcare.security.CustomUserDetails;
import com.healthcare.security.JwtUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final com.healthcare.service.EmailService emailService;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody AuthRequest loginRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = jwtUtils.generateJwtToken(authentication);

            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();

            // Get additional user info
            User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();

            return ResponseEntity.ok(AuthResponse.builder()
                    .token(jwt)
                    .email(user.getEmail())
                    .role(user.getRole())
                    .organizationId(user.getOrganizationId())
                    .firstName(user.getFirstName())
                    .lastName(user.getLastName())
                    .orgAdmin(user.isOrgAdmin())
                    .build());

        } catch (DisabledException ex) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(
                    Map.of(
                            "error", "ACCOUNT_NOT_ACTIVATED",
                            "message", "Your account is pending admin approval. Please wait for the administrator to activate your account before logging in."
                    ));
        } catch (BadCredentialsException ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                    Map.of(
                            "error", "BAD_CREDENTIALS",
                            "message", "Invalid email address or password. Please check your credentials and try again."
                    ));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequest signUpRequest) {
        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body("Error: Email is already in use!");
        }

        if (signUpRequest.getConfirmPassword() != null && !signUpRequest.getPassword().equals(signUpRequest.getConfirmPassword())) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body("Error: Passwords do not match!");
        }

        boolean isFirstInOrg = userRepository.findFirstByOrganizationId(signUpRequest.getOrganizationId()).isEmpty();

        // Create new user's account
        User user = User.builder()
                .email(signUpRequest.getEmail())
                .password(passwordEncoder.encode(signUpRequest.getPassword()))
                .role(signUpRequest.getRole().toUpperCase())
                .organizationId(signUpRequest.getOrganizationId())
                .firstName(signUpRequest.getFirstName())
                .lastName(signUpRequest.getLastName())
                .addressLine1(signUpRequest.getAddressLine1())
                .addressLine2(signUpRequest.getAddressLine2())
                .city(signUpRequest.getCity())
                .state(signUpRequest.getState())
                .zipCode(signUpRequest.getZipCode())
                .orgAdmin(isFirstInOrg)
                .build();

        userRepository.save(user);

        // Send intimation email to admin
        String adminEmail = "bharath.kankarla@toucanus.com";
        String subject = "New User Registration Alert";
        String body = String.format("A new %s has registered on the platform.<br><br>Name: %s %s<br>Email: %s<br>Organization ID: %s<br><br>Please log in to the Admin Dashboard to review and approve their account.",
                user.getRole(), user.getFirstName(), user.getLastName(), user.getEmail(), user.getOrganizationId());
        emailService.sendEmail(adminEmail, subject, body);

        return ResponseEntity.status(HttpStatus.CREATED).body("User registered successfully and is pending admin approval!");
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordRequest resetRequest) {
        if (!resetRequest.getNewPassword().equals(resetRequest.getConfirmPassword())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error: Passwords do not match!");
        }

        User user = userRepository.findAll().stream()
                .filter(u -> resetRequest.getToken().equals(u.getPasswordResetToken()))
                .findFirst()
                .orElse(null);

        if (user == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error: Invalid or expired password reset token!");
        }

        if (user.getPasswordResetTokenExpiry() != null && user.getPasswordResetTokenExpiry().before(new java.util.Date())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error: Password reset token has expired!");
        }

        user.setPassword(passwordEncoder.encode(resetRequest.getNewPassword()));
        user.setPasswordResetToken(null);
        user.setPasswordResetTokenExpiry(null);
        userRepository.save(user);

        return ResponseEntity.ok("Password reset successfully. You may now log in.");
    }
}
