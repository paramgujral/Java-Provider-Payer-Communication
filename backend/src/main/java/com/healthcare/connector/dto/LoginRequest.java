package com.healthcare.connector.dto;

import lombok.Data;

@Data
public class LoginRequest {
    private Long roleId;
    private String roleName;
    private String username;
    private String password;
}
