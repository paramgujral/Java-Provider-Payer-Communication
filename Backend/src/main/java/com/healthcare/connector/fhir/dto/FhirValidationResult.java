package com.healthcare.connector.fhir.dto;

import lombok.*;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FhirValidationResult {
    private boolean valid;

    @Builder.Default
    private List<FhirIssue> issues = new ArrayList<>();

    public void addIssue(String code, String message) {
        issues.add(new FhirIssue(code, message));
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FhirIssue {
        private String code;
        private String message;
    }
}
