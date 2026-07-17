package com.sana.healthcareconnector.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "authorization_requests")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ClaimEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String patientName;

    private String treatment;

    private String diagnosis;

    private Double estimatedCost;

    @Enumerated(EnumType.STRING)
    private ClaimStatus status;

    private String provider;

    private String payer;

}

