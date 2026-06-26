package com.healthcare.connector.auth.service;

import com.healthcare.connector.auth.dto.AuthDTO;
import com.healthcare.connector.auth.entity.User;
import com.healthcare.connector.auth.enums.UserRole;
import com.healthcare.connector.auth.repository.UserRepository;
import com.healthcare.connector.auth.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationContext;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService implements UserDetailsService {

    private final UserRepository userRepo;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtProvider;
    // Lazily fetched to break the circular dependency:
    // UserService -> SecurityConfig -> JwtAuthFilter -> UserService
    private final ApplicationContext applicationContext;

    private AuthenticationManager getAuthManager() {
        return applicationContext.getBean(AuthenticationManager.class);
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return userRepo.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
    }

    public AuthDTO.AuthResponse register(AuthDTO.RegisterRequest req) {
        if (userRepo.existsByUsername(req.getUsername()))
            throw new IllegalArgumentException("Username already taken");
        if (userRepo.existsByEmail(req.getEmail()))
            throw new IllegalArgumentException("Email already registered");

        User user = User.builder()
                .username(req.getUsername())
                .password(passwordEncoder.encode(req.getPassword()))
                .fullName(req.getFullName())
                .email(req.getEmail())
                .role(req.getRole())
                .organizationId(req.getOrganizationId())
                .organizationName(req.getOrganizationName())
                .enabled(true)
                .build();
        user = userRepo.save(user);

        String token = jwtProvider.generateToken(user);
        return buildAuthResponse(user, token);
    }

    public AuthDTO.AuthResponse login(AuthDTO.LoginRequest req) {
        getAuthManager().authenticate(
                new UsernamePasswordAuthenticationToken(req.getUsername(), req.getPassword()));
        User user = (User) loadUserByUsername(req.getUsername());
        user.setLastLoginAt(LocalDateTime.now());
        userRepo.save(user);
        String token = jwtProvider.generateToken(user);
        return buildAuthResponse(user, token);
    }

    public List<AuthDTO.UserResponse> getPayers() {
        return userRepo.findByRole(UserRole.PAYER).stream()
                .map(this::toUserResponse)
                .collect(Collectors.toList());
    }

    public List<AuthDTO.UserResponse> getProviders() {
        return userRepo.findByRole(UserRole.PROVIDER).stream()
                .map(this::toUserResponse)
                .collect(Collectors.toList());
    }

    private AuthDTO.AuthResponse buildAuthResponse(User user, String token) {
        return AuthDTO.AuthResponse.builder()
                .token(token)
                .username(user.getUsername())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole())
                .organizationId(user.getOrganizationId())
                .organizationName(user.getOrganizationName())
                .userId(user.getId())
                .build();
    }

    private AuthDTO.UserResponse toUserResponse(User u) {
        return AuthDTO.UserResponse.builder()
                .id(u.getId())
                .username(u.getUsername())
                .fullName(u.getFullName())
                .email(u.getEmail())
                .role(u.getRole())
                .organizationId(u.getOrganizationId())
                .organizationName(u.getOrganizationName())
                .build();
    }
}