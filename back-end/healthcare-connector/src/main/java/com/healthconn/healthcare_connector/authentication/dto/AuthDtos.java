package com.healthconn.healthcare_connector.authentication.dto;

import com.healthconn.healthcare_connector.authentication.entity.Role;
import jakarta.validation.constraints.*;

public class AuthDtos {

    public record RegisterRequest(
            @NotBlank @Email String email,
            @NotBlank @Size(min = 6) String password,
            @NotBlank String fullName,
            @NotNull Role role
    ) {}

    public record LoginRequest(
            @NotBlank @Email String email,
            @NotBlank String password
    ) {}

    public record AuthResponse(
            String token,
            Long userId,
            String email,
            String fullName,
            String role
    ) {}
}