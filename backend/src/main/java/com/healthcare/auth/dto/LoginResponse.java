package com.healthcare.auth.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class LoginResponse {

    private String token;

    private Long id;

    private String firstName;

    private String lastName;

    private String email;

    private String role;
}
