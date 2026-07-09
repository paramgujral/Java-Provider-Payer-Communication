package com.healthconnect.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * Audit trail of status transitions for an AuthorizationRequest.
 * Used to power the "status tracking and notification" requirement.
 */
@Entity
@Table(name = "authorization_history")
@Data
@NoArgsConstructor
public class AuthorizationHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "authorization_request_id")
    private AuthorizationRequest authorizationRequest;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AuthorizationStatus previousStatus;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AuthorizationStatus newStatus;

    @Column(columnDefinition = "TEXT")
    private String note;

    @Column(nullable = false)
    private String changedByUsername;

    @Column(nullable = false)
    private LocalDateTime changedAt;

    @PrePersist
    protected void onCreate() {
        changedAt = LocalDateTime.now();
    }
}
