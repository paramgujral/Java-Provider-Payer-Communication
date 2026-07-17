package com.healthcare.fhir.entity;

import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "fhir_resource")
public class FhirResourceEntity {

    @Id
    @Column(name = "id", length = 100)
    private String id;

    @Column(name = "resource_type", length = 50, nullable = false)
    private String resourceType;

    @Column(name = "resource", columnDefinition = "text")
    private String resource;

    @Column(name = "version_id")
    private String versionId;

    @Column(name = "last_updated")
    private Instant lastUpdated;

    public FhirResourceEntity() {}

    public FhirResourceEntity(String id, String resourceType, String resource, String versionId, Instant lastUpdated) {
        this.id = id;
        this.resourceType = resourceType;
        this.resource = resource;
        this.versionId = versionId;
        this.lastUpdated = lastUpdated;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getResourceType() { return resourceType; }
    public void setResourceType(String resourceType) { this.resourceType = resourceType; }
    public String getResource() { return resource; }
    public void setResource(String resource) { this.resource = resource; }
    public String getVersionId() { return versionId; }
    public void setVersionId(String versionId) { this.versionId = versionId; }
    public Instant getLastUpdated() { return lastUpdated; }
    public void setLastUpdated(Instant lastUpdated) { this.lastUpdated = lastUpdated; }
}
