package com.connector.auth.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
@Table(name = "copilot_issue")
public class CopilotIssue {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "review_id")
    @JsonIgnore
    private CopilotReview review;

    @Enumerated(EnumType.STRING) @Column(length = 10)
    private Severity severity;
    private String field;
    @Lob @Column(columnDefinition = "TEXT") private String problem;
    @Lob @Column(columnDefinition = "TEXT") private String recommendation;
    private Boolean autoFixable = false;

    public Long getId() { return id; }
    public CopilotReview getReview() { return review; }
    public void setReview(CopilotReview r) { this.review = r; }
    public Severity getSeverity() { return severity; }
    public void setSeverity(Severity v) { this.severity = v; }
    public String getField() { return field; }
    public void setField(String v) { this.field = v; }
    public String getProblem() { return problem; }
    public void setProblem(String v) { this.problem = v; }
    public String getRecommendation() { return recommendation; }
    public void setRecommendation(String v) { this.recommendation = v; }
    public Boolean getAutoFixable() { return autoFixable; }
    public void setAutoFixable(Boolean v) { this.autoFixable = v; }
}
