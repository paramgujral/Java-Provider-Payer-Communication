package com.healthcare.connector.models;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "payers")
@Data
public class Payer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    @Column(unique = true)
    private String payerId;
    private String email;
}
