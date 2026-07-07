package com.healthcareconnector.model;

import java.util.List;

public class AIReview {
    private boolean isValid;
    private String reviewedAt;
    private List<String> issues;
    private List<String> suggestions;
    private String summary;

    public AIReview() {}

    public AIReview(boolean isValid, String reviewedAt, List<String> issues, List<String> suggestions, String summary) {
        this.isValid = isValid;
        this.reviewedAt = reviewedAt;
        this.issues = issues;
        this.suggestions = suggestions;
        this.summary = summary;
    }

    public boolean isValid() { return isValid; }
    public void setValid(boolean valid) { isValid = valid; }

    public String getReviewedAt() { return reviewedAt; }
    public void setReviewedAt(String reviewedAt) { this.reviewedAt = reviewedAt; }

    public List<String> getIssues() { return issues; }
    public void setIssues(List<String> issues) { this.issues = issues; }

    public List<String> getSuggestions() { return suggestions; }
    public void setSuggestions(List<String> suggestions) { this.suggestions = suggestions; }

    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }
}
