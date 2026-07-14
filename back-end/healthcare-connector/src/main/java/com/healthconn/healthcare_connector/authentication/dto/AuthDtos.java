package com.healthconn.healthcare_connector.authentication.dto;

import com.healthconn.healthcare_connector.authentication.entity.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public final class AuthDtos {

    private AuthDtos() {
        // Utility class
    }

    /**
     * User Registration Request
     */
    public record RegisterRequest(

            @NotBlank(message = "Email is required")
            @Email(message = "Please enter a valid email address")
            String email,

            @NotBlank(message = "Password is required")
            @Size(min = 6, message = "Password must contain at least 6 characters")
            String password,

            @NotBlank(message = "Full name is required")
            @Size(min = 3, max = 100, message = "Full name must be between 3 and 100 characters")
            String fullName,

            @NotNull(message = "Role is required")
            Role role

    ) {
    }

    /**
     * Login Request
     */
    public record LoginRequest(

            @NotBlank(message = "Email is required")
            @Email(message = "Invalid email address")
            String email,

            @NotBlank(message = "Password is required")
            String password

    ) {
    }

    /**
     * Authentication Response
     */
    public record AuthResponse(

            String token,
            Long userId,
            String email,
            String fullName,
            String role

    ) {
    }

}