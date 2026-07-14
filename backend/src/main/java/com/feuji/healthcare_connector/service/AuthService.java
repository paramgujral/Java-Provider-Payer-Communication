package com.feuji.healthcare_connector.service;

import com.feuji.healthcare_connector.config.JwtUtil;
import com.feuji.healthcare_connector.dto.request.*;
import com.feuji.healthcare_connector.dto.response.AuthResponse;
import com.feuji.healthcare_connector.entity.PasswordResetToken;
import com.feuji.healthcare_connector.entity.User;
import com.feuji.healthcare_connector.enums.UserRole;
import com.feuji.healthcare_connector.exception.BadRequestException;
import com.feuji.healthcare_connector.exception.ResourceNotFoundException;
import com.feuji.healthcare_connector.exception.UnauthorizedException;
import com.feuji.healthcare_connector.repository.PasswordResetTokenRepository;
import com.feuji.healthcare_connector.repository.UserRepository;
import com.feuji.healthcare_connector.util.OtpUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RedisService redisService;

    @Autowired
    private PasswordResetTokenRepository passwordResetTokenRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private EmailService emailService;

    @Autowired
    private UserDetailsService userDetailsService;

    @Transactional
    public void register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already registered.");
        }

        if (request.getRole() == UserRole.PROVIDER && 
            (request.getProviderType() == null || request.getProviderType().trim().isEmpty())) {
            throw new BadRequestException("Provider type is required for provider registrations.");
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());
        user.setOrganizationName(request.getOrganizationName());
        user.setProviderType(request.getRole() == UserRole.PROVIDER ? request.getProviderType() : null);
        user.setPhone(request.getPhone());
        user.setEmailVerified(false);

        User savedUser = userRepository.save(user);

        // Generate OTP
        String otpCode = OtpUtil.generateOtp();
        redisService.set("OTP:" + savedUser.getEmail(), otpCode, 600); // 10 minutes TTL

        // Send Email
        emailService.sendOtpEmail(savedUser.getEmail(), otpCode);
    }

    @Transactional
    public AuthResponse verifyOtp(OtpVerificationRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + request.getEmail()));

        if (user.getEmailVerified()) {
            throw new BadRequestException("Email is already verified.");
        }

        String storedOtp = redisService.get("OTP:" + user.getEmail());
        if (storedOtp == null || storedOtp.trim().isEmpty()) {
            throw new BadRequestException("No active OTP request found or it has expired.");
        }

        if (!storedOtp.equals(request.getOtp())) {
            throw new BadRequestException("Invalid OTP code.");
        }

        // OTP is valid, clear it from Redis
        redisService.set("OTP:" + user.getEmail(), "", 1);

        user.setEmailVerified(true);
        User verifiedUser = userRepository.save(user);

        return buildAuthResponse(verifiedUser);
    }

    @Transactional
    public void resendOtp(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        if (user.getEmailVerified()) {
            throw new BadRequestException("Email is already verified.");
        }

        // Generate new OTP, overwriting any previous unverified OTP in Redis
        String otpCode = OtpUtil.generateOtp();
        redisService.set("OTP:" + user.getEmail(), otpCode, 600); // 10 minutes TTL

        emailService.sendOtpEmail(user.getEmail(), otpCode);
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password."));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new UnauthorizedException("Invalid email or password.");
        }

        if (!user.getEmailVerified()) {
            throw new UnauthorizedException("Email is not verified. Please verify your email first.");
        }

        return buildAuthResponse(user);
    }

    @Transactional
    public void forgotPassword(String email) {
        // Silently return to prevent email enumeration attacks, but send email if user exists
        userRepository.findByEmail(email).ifPresent(user -> {
            // Invalidate old active reset tokens
            passwordResetTokenRepository.findFirstByUserAndUsedFalseOrderByCreatedAtDesc(user)
                    .ifPresent(token -> {
                        token.setUsed(true);
                        passwordResetTokenRepository.save(token);
                    });

            String tokenStr = UUID.randomUUID().toString();
            PasswordResetToken resetToken = new PasswordResetToken();
            resetToken.setUser(user);
            resetToken.setToken(tokenStr);
            resetToken.setExpiresAt(LocalDateTime.now().plusMinutes(30));
            resetToken.setUsed(false);
            passwordResetTokenRepository.save(resetToken);

            // In real app, this links to frontend reset page
            String resetLink = "http://localhost:4200/reset-password?token=" + tokenStr;
            emailService.sendPasswordResetEmail(user.getEmail(), resetLink);
        });
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(request.getToken())
                .orElseThrow(() -> new BadRequestException("Invalid or missing password reset token."));

        if (resetToken.getUsed()) {
            throw new BadRequestException("This reset token has already been used.");
        }

        if (resetToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("This reset token has expired.");
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        resetToken.setUsed(true);
        passwordResetTokenRepository.save(resetToken);
    }

    private AuthResponse buildAuthResponse(User user) {
        UserDetails userDetails = new org.springframework.security.core.userdetails.User(
                user.getEmail(), user.getPassword(), user.getEmailVerified(),
                true, true, true,
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()))
        );
        String token = jwtUtil.generateToken(userDetails, Map.of(
                "userId", user.getId(), "role", user.getRole().name(),
                "organizationName", user.getOrganizationName()));
        return new AuthResponse(user.getId(), user.getName(), user.getEmail(),
                user.getRole(), user.getOrganizationName(), token);
    }
}
