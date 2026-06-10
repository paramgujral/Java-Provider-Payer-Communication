package ai.authbridge.domain;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

/** A supporting clinical document attached to an authorization request. */
@Entity
@Table(name = "clinical_document")
public class ClinicalDocument {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "request_id")
    private AuthorizationRequest request;

    private String name;
    private String type;
    private long sizeKb;

    /** In production this is an object-store key (S3/GCS), not the bytes. */
    private String storageKey;

    private Instant uploadedAt = Instant.now();

    public UUID getId() { return id; }
    public AuthorizationRequest getRequest() { return request; }
    public void setRequest(AuthorizationRequest r) { this.request = r; }
    public String getName() { return name; }
    public void setName(String v) { this.name = v; }
    public String getType() { return type; }
    public void setType(String v) { this.type = v; }
    public long getSizeKb() { return sizeKb; }
    public void setSizeKb(long v) { this.sizeKb = v; }
    public String getStorageKey() { return storageKey; }
    public void setStorageKey(String v) { this.storageKey = v; }
    public Instant getUploadedAt() { return uploadedAt; }
    public void setUploadedAt(Instant v) { this.uploadedAt = v; }
}
