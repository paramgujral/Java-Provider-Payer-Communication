package com.healthcare.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "network_affiliations")
@CompoundIndex(name = "provider_payer_idx", def = "{'providerId': 1, 'payerId': 1}", unique = true)
public class NetworkAffiliation {
    @Id
    private String id;

    private String providerId;
    private String payerId;

    private AffiliationStatus status;

    private String notes;

    @CreatedDate
    private Instant requestedAt;

    @LastModifiedDate
    private Instant updatedAt;

    public enum AffiliationStatus {
        PENDING, APPROVED, REJECTED
    }
}
