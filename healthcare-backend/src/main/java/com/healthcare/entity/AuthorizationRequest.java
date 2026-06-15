package com.healthcare.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.annotation.Version;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

/**
 * Core domain entity modeled after FHIR ClaimResponse / Prior Authorization.
 * Supports bidirectional communication between Provider and Payer.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "authorization_requests")
@CompoundIndex(name = "provider_status_idx", def = "{'providerId': 1, 'status': 1}")
@CompoundIndex(name = "payer_status_idx", def = "{'payerId': 1, 'status': 1}")
public class AuthorizationRequest {
    @Id
    private String id;

    @Indexed
    private String providerId;

    @Indexed
    private String payerId;

    // --- FHIR-aligned Patient Resource ---
    private PatientInfo patientInfo;

    // --- FHIR-aligned Clinical Data ---
    private List<String> diagnosisCodes;   // ICD-10 codes
    private List<String> procedureCodes;   // CPT codes
    private String serviceType;            // FHIR: type of service (e.g., "inpatient", "outpatient", "surgery")
    private String urgency;                // FHIR: "routine", "urgent", "emergency"

    // --- FHIR-aligned Insurance / Coverage ---
    private CoverageInfo coverageInfo;

    // --- Status Tracking ---
    private RequestStatus status;

    // --- AI Copilot Results ---
    private Double aiConfidenceScore;
    private List<String> aiRecommendations;

    // --- Bidirectional Communication (Payer Responses) ---
    @Builder.Default
    private List<CommunicationNote> communicationNotes = new ArrayList<>();

    // --- Optimistic Locking for concurrent updates ---
    @Version
    private Long version;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;

    public enum RequestStatus {
        DRAFT, PENDING, APPROVED, REJECTED, INFO_REQUESTED
    }

    /**
     * FHIR-aligned Patient resource (subset).
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PatientInfo {
        private String memberId;
        private String firstName;
        private String lastName;
        private String dateOfBirth;
        private String gender;         // FHIR: male, female, other, unknown
        private String phone;

        public String getFullName() {
            return this.firstName + " " + this.lastName;
        }
    }

    /**
     * FHIR-aligned Coverage resource (subset).
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CoverageInfo {
        private String insurancePlanId;
        private String groupNumber;
        private String subscriberId;
        private String relationshipToSubscriber; // self, spouse, child
    }

    /**
     * Enables bidirectional communication between Provider and Payer.
     * Both parties can add timestamped notes to a request.
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CommunicationNote {
        private String authorId;      // who wrote the note
        private String authorRole;    // PROVIDER or PAYER
        private String content;       // the message text
        private Instant timestamp;
    }
}
