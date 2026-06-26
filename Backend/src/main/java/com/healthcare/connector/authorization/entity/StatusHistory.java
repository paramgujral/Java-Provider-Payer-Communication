package com.healthcare.connector.authorization.entity;

import com.healthcare.connector.authorization.enums.AuthorizationStatus;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "status_history")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StatusHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "request_id")
    private AuthorizationRequest authorizationRequest;

    @Enumerated(EnumType.STRING)
    private AuthorizationStatus fromStatus;

    @Enumerated(EnumType.STRING)
    private AuthorizationStatus toStatus;

    private String changedBy;
    private String changeReason;
    private LocalDateTime changedAt;

    @PrePersist
    public void prePersist() {
        changedAt = LocalDateTime.now();
    }
}

