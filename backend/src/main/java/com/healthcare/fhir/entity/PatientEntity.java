package com.healthcare.fhir.entity;

import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "fhir_patient")
public class PatientEntity {

    @Id
    @Column(name = "id", length = 100)
    private String id;

    @Column(name = "resource", columnDefinition = "text")
    private String resource;

    @Column(name = "version_id")
    private String versionId;

    @Column(name = "last_updated")
    private Instant lastUpdated;

    public PatientEntity() {
    }

    public PatientEntity(String id, String resource, String versionId, Instant lastUpdated) {
        this.id = id;
        this.resource = resource;
        this.versionId = versionId;
        this.lastUpdated = lastUpdated;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getResource() {
        return resource;
    }

    public void setResource(String resource) {
        this.resource = resource;
    }

    public String getVersionId() {
        return versionId;
    }

    public void setVersionId(String versionId) {
        this.versionId = versionId;
    }

    public Instant getLastUpdated() {
        return lastUpdated;
    }

    public void setLastUpdated(Instant lastUpdated) {
        this.lastUpdated = lastUpdated;
    }
}
