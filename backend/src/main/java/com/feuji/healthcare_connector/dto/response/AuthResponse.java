package com.feuji.healthcare_connector.dto.response;

import com.feuji.healthcare_connector.enums.UserRole;

public class AuthResponse {
    private Long id;
    private String name;
    private String email;
    private UserRole role;
    private String organizationName;
    private String token;

    public AuthResponse(Long id, String name, String email, UserRole role, String organizationName, String token) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.role = role;
        this.organizationName = organizationName;
        this.token = token;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public UserRole getRole() { return role; }
    public void setRole(UserRole role) { this.role = role; }

    public String getOrganizationName() { return organizationName; }
    public void setOrganizationName(String organizationName) { this.organizationName = organizationName; }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
}
