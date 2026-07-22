package com.healthconn.healthcare_connector.authentication.service;

import com.healthconn.healthcare_connector.authentication.dto.AuthModels.AuthResponse;
import com.healthconn.healthcare_connector.authentication.dto.AuthModels.LoginRequest;
import com.healthconn.healthcare_connector.authentication.dto.AuthModels.RegisterRequest;
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
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new RuntimeException("Email already registered");
        }
        User user = User.builder()
                .email(req.getEmail())
                .password(passwordEncoder.encode(req.getPassword()))
                .fullName(req.getFullName())
                .role(req.getRole())
                .build();
        userRepository.save(user);
        String token = jwtUtil.generateToken(user, user.getRole().name(), user.getId());
        return new AuthResponse(token, user.getId(), user.getEmail(),
                user.getFullName(), user.getRole().name());
    }

    public AuthResponse login(LoginRequest req) {
        User user = userRepository.findByEmail(req.getEmail())
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        if (!passwordEncoder.matches(req.getPassword(), user.getPassword())) {
            throw new BadCredentialsException("Invalid email or password");
        }

        String token = jwtUtil.generateToken(user, user.getRole().name(), user.getId());
        return new AuthResponse(token, user.getId(), user.getEmail(),
                user.getFullName(), user.getRole().name());
    }
}