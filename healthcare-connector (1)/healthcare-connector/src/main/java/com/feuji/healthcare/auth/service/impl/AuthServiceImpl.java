package com.feuji.healthcare.auth.service.impl;

import com.feuji.healthcare.auth.dto.LoginRequestDto;
import com.feuji.healthcare.auth.dto.LoginResponseDto;
import com.feuji.healthcare.auth.dto.RegisterRequestDto;
import com.feuji.healthcare.auth.entity.RoleEntity;
import com.feuji.healthcare.auth.entity.UserEntity;
import com.feuji.healthcare.auth.repository.RoleRepository;
import com.feuji.healthcare.auth.repository.UserRepository;
import com.feuji.healthcare.auth.service.AuthService;
import com.feuji.healthcare.common.exception.BadRequestException;
import com.feuji.healthcare.common.exception.ResourceNotFoundException;
import com.feuji.healthcare.security.jwt.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Set;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;

    @Override
    public void register(RegisterRequestDto request) {

        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new BadRequestException("Username already exists");
        }

        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new BadRequestException("Email already exists");
        }

        RoleEntity role = roleRepository
                .findByRoleName(request.getRole())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Role not found"));

        UserEntity user = UserEntity.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(
                        passwordEncoder.encode(
                                request.getPassword()))
                .enabled(true)
                .roles(Set.of(role))
                .build();

        userRepository.save(user);
    }

    @Override
    public LoginResponseDto login(LoginRequestDto request) {

        Authentication authentication =
                authenticationManager.authenticate(
                        new UsernamePasswordAuthenticationToken(
                                request.getUsername(),
                                request.getPassword()
                        )
                );

        UserEntity user = userRepository
                .findByUsername(request.getUsername())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found"));

        String token =
                jwtTokenProvider.generateToken(
                        user.getUsername());

        String role =
                user.getRoles()
                        .stream()
                        .findFirst()
                        .map(r -> r.getRoleName().name())
                        .orElse("");

        return LoginResponseDto.builder()
                .accessToken(token)
                .username(user.getUsername())
                .role(role)
                .build();
    }
}