package com.healthcare.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class RegisterRequest {
    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Password is required")
    private String password;

    @NotBlank(message = "Role is required")
    @Pattern(regexp = "^(PROVIDER|PAYER)$", message = "Role must be PROVIDER or PAYER")
    private String role;

    @NotBlank(message = "Organization ID is required")
    private String organizationId;

    @NotBlank(message = "First name is required")
    private String firstName;

    @NotBlank(message = "Last name is required")
    private String lastName;

    private String confirmPassword;

    private String addressLine1;
    private String addressLine2;
    private String city;
    private String state;
    private String zipCode;
}
