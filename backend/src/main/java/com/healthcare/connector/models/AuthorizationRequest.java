package com.healthcare.connector.models;

import com.healthcare.connector.enums.RequestStatus;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "authorization_requests")
@Data
public class AuthorizationRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String requestId;

    @ManyToOne
    @JoinColumn(name = "provider_id")
    private Provider provider;

    @ManyToOne
    @JoinColumn(name = "payer_id")
    private Payer payer;

    private String patientId;
    private String serviceType;

    @CreationTimestamp
    private LocalDateTime requestDate;

    @Enumerated(EnumType.STRING)
    private RequestStatus status;

    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String fhirClaimJson;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
