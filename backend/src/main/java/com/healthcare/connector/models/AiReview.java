package com.healthcare.connector.models;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "ai_reviews")
@Data
public class AiReview {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "request_id")
    private AuthorizationRequest request;

    @CreationTimestamp
    private LocalDateTime reviewDate;

    @Column(length = 4000)
    private String issues;

    @Column(length = 4000)
    private String suggestions;

    private Integer score; // 0–100
}
