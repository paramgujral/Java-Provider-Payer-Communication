package com.healthconnector.dto;

import java.util.List;

public class ValidationResultDto {

    private boolean valid;
    private List<Issue> issues;

    public ValidationResultDto() {}

    public ValidationResultDto(boolean valid, List<Issue> issues) {
        this.valid = valid;
        this.issues = issues;
    }

    public boolean isValid() { return valid; }
    public void setValid(boolean valid) { this.valid = valid; }

    public List<Issue> getIssues() { return issues; }
    public void setIssues(List<Issue> issues) { this.issues = issues; }

    public static class Issue {
        private String field;
        private String message;

        public Issue() {}

        public Issue(String field, String message) {
            this.field = field;
            this.message = message;
        }

        public String getField() { return field; }
        public void setField(String field) { this.field = field; }

        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
    }
}
