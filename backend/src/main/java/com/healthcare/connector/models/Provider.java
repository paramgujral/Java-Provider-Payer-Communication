package com.healthcare.connector.models;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "providers")
@Data
public class Provider {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    @Column(unique = true)
    private String npi;
    private String email;
}
