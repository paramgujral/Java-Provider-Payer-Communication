package com.healthcare.connector.models;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Data
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "request_id")
    private AuthorizationRequest request;

    private String recipientEmail;
    private String message;

    @CreationTimestamp
    private LocalDateTime sentDate;

    private Boolean isRead = false;
}
