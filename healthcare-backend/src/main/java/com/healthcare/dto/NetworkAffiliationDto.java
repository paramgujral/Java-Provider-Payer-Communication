package com.healthcare.dto;

import com.healthcare.entity.NetworkAffiliation.AffiliationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NetworkAffiliationDto {
    private String id;
    private String providerId;
    private String payerId;
    
    // For UI display
    private String providerName;
    private String payerName;

    private AffiliationStatus status;
    private String notes;
    private Instant requestedAt;
    private Instant updatedAt;
}
