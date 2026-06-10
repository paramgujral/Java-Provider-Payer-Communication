package com.connector.auth.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "copilot_review")
public class CopilotReview {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "request_id")
    @JsonIgnore
    private AuthorizationRequest request;

    @Column(nullable = false) private String source;          // LLM | RULES
    @Column(nullable = false) private Integer readinessScore;
    @Column(nullable = false) private String decision;         // READY | NEEDS_FIXES
    private String predictedOutcome;                           // LIKELY_APPROVE | UNCERTAIN | LIKELY_DENY
    @Lob @Column(columnDefinition = "TEXT") private String medicalNecessity;
    @Lob @Column(columnDefinition = "TEXT") private String summary;
    @Column(nullable = false) private LocalDateTime createdAt = LocalDateTime.now();

    @OneToMany(mappedBy = "review", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CopilotIssue> issues = new ArrayList<>();

    public void addIssue(CopilotIssue i) { i.setReview(this); issues.add(i); }

    public Long getId() { return id; }
    public AuthorizationRequest getRequest() { return request; }
    public void setRequest(AuthorizationRequest r) { this.request = r; }
    public String getSource() { return source; }
    public void setSource(String v) { this.source = v; }
    public Integer getReadinessScore() { return readinessScore; }
    public void setReadinessScore(Integer v) { this.readinessScore = v; }
    public String getDecision() { return decision; }
    public void setDecision(String v) { this.decision = v; }
    public String getPredictedOutcome() { return predictedOutcome; }
    public void setPredictedOutcome(String v) { this.predictedOutcome = v; }
    public String getMedicalNecessity() { return medicalNecessity; }
    public void setMedicalNecessity(String v) { this.medicalNecessity = v; }
    public String getSummary() { return summary; }
    public void setSummary(String v) { this.summary = v; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime v) { this.createdAt = v; }
    public List<CopilotIssue> getIssues() { return issues; }
    public void setIssues(List<CopilotIssue> v) { this.issues = v; }
}
