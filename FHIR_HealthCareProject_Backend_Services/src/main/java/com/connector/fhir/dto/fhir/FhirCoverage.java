package com.connector.fhir.dto.fhir;

import java.util.List;

public class FhirCoverage {
    private String resourceType = "Coverage";
    private String id;
    private String status; // active, cancelled, draft
    private String subscriberId;
    private Reference beneficiary;
    private List<Reference> payor;

    public static class Reference {
        private String reference; // e.g. "Patient/pat-101"
        private String display;

        public Reference() {}

        public Reference(String reference, String display) {
            this.reference = reference;
            this.display = display;
        }

        public String getReference() { return reference; }
        public void setReference(String reference) { this.reference = reference; }
        public String getDisplay() { return display; }
        public void setDisplay(String display) { this.display = display; }
    }

    public FhirCoverage() {}

    public String getResourceType() { return resourceType; }
    public void setResourceType(String resourceType) { this.resourceType = resourceType; }
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getSubscriberId() { return subscriberId; }
    public void setSubscriberId(String subscriberId) { this.subscriberId = subscriberId; }
    public Reference getBeneficiary() { return beneficiary; }
    public void setBeneficiary(Reference beneficiary) { this.beneficiary = beneficiary; }
    public List<Reference> getPayor() { return payor; }
    public void setPayor(List<Reference> payor) { this.payor = payor; }
}
