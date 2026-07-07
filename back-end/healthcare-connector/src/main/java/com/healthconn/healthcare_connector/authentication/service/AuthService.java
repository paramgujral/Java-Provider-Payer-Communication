package com.healthconn.healthcare_connector.authentication.service;

import com.healthconn.healthcare_connector.authentication.dto.AuthDtos.AuthResponse;
import com.healthconn.healthcare_connector.authentication.dto.AuthDtos.LoginRequest;
import com.healthconn.healthcare_connector.authentication.dto.AuthDtos.RegisterRequest;
import com.healthconn.healthcare_connector.authentication.entity.User;
import com.healthconn.healthcare_connector.authentication.repository.UserRepository;
import com.healthconn.healthcare_connector.config.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthResponse register(RegisterRequest req) {
        if (userRepository.existsByEmail(req.email())) {
            throw new RuntimeException("Email already registered");
        }
        User user = User.builder()
                .email(req.email())
                .password(passwordEncoder.encode(req.password()))
                .fullName(req.fullName())
                .role(req.role())
                .build();
        userRepository.save(user);
        String token = jwtUtil.generateToken(user, user.getRole().name(), user.getId());
        return new AuthResponse(token, user.getId(), user.getEmail(),
                user.getFullName(), user.getRole().name());
    }

    public AuthResponse login(LoginRequest req) {
        User user = userRepository.findByEmail(req.email())
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        if (!passwordEncoder.matches(req.password(), user.getPassword())) {
            throw new BadCredentialsException("Invalid email or password");
        }

        String token = jwtUtil.generateToken(user, user.getRole().name(), user.getId());
        return new AuthResponse(token, user.getId(), user.getEmail(),
                user.getFullName(), user.getRole().name());
    }
}