package com.healthconnect.model;

/**
 * Mirrors FHIR Claim.status / ClaimResponse outcome values used in
 * prior-authorization workflows (aligned with the FHIR "Claim" and
 * "ClaimResponse" resources used by Da Vinci PAS - Prior Authorization Support).
 */
public enum AuthorizationStatus {
    DRAFT,          // Provider is still preparing the request
    SUBMITTED,      // Sent to payer, awaiting review
    IN_REVIEW,      // Payer is actively reviewing
    PENDED,         // Payer needs more info / corrections
    APPROVED,       // Payer approved
    PARTIAL,        // Payer partially approved
    REJECTED,       // Payer denied
    CANCELLED       // Provider withdrew the request
}
