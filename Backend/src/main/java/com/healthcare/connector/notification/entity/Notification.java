package com.healthcare.connector.notification.entity;

import com.healthcare.connector.auth.entity.User;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipient_id")
    private User recipient;

    private String title;

    @Column(length = 1000)
    private String message;

    private String type;              // STATUS_CHANGE, AI_REVIEW, APPROVAL, DENIAL, INFO_REQUEST
    private String referenceNumber;   // Auth request reference
    private Long authRequestId;

    private boolean read;
    private LocalDateTime readAt;
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        createdAt = LocalDateTime.now();
        read = false;
    }
}

