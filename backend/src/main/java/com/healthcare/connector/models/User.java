package com.healthcare.connector.models;

import com.healthcare.connector.enums.Role;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(unique = true, nullable = false)
    private String username;
    @Column(nullable = false)
    private String passwordHash;
    @Enumerated(EnumType.STRING)
    private Role role;
    private Long providerId;
    private Long payerId;

    public Long getEntityId() {
        return role == Role.PROVIDER ? providerId : payerId;
    }
}

