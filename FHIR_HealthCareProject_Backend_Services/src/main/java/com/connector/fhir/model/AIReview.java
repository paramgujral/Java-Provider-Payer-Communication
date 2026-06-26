package com.connector.fhir.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "ai_reviews")
public class AIReview {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "request_id", nullable = false)
    private AuthorizationRequest request;

    @Column(name = "confidence_score", nullable = false)
    private Double confidenceScore;

    @Column(name = "status_validation", nullable = false)
    private Boolean statusValidation;

    @Column(columnDefinition = "TEXT")
    private String issues; // Stored as a JSON string

    @Column(columnDefinition = "TEXT")
    private String recommendations; // Stored as a JSON string

    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
    }

    public AIReview() {}

    public AIReview(AuthorizationRequest request, Double confidenceScore, Boolean statusValidation, String issues, String recommendations) {
        this.request = request;
        this.confidenceScore = confidenceScore;
        this.statusValidation = statusValidation;
        this.issues = issues;
        this.recommendations = recommendations;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public AuthorizationRequest getRequest() { return request; }
    public void setRequest(AuthorizationRequest request) { this.request = request; }

    public Double getConfidenceScore() { return confidenceScore; }
    public void setConfidenceScore(Double confidenceScore) { this.confidenceScore = confidenceScore; }

    public Boolean getStatusValidation() { return statusValidation; }
    public void setStatusValidation(Boolean statusValidation) { this.statusValidation = statusValidation; }

    public String getIssues() { return issues; }
    public void setIssues(String issues) { this.issues = issues; }

    public String getRecommendations() { return recommendations; }
    public void setRecommendations(String recommendations) { this.recommendations = recommendations; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
