package ai.authbridge.domain;

import ai.authbridge.domain.Enums.Priority;
import ai.authbridge.domain.Enums.RequestStatus;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/** Aggregate root for a prior authorization request. */
@Entity
@Table(name = "auth_request", indexes = {
        @Index(name = "idx_req_status", columnList = "status"),
        @Index(name = "idx_req_payer", columnList = "payer_org")
})
public class AuthorizationRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true)
    private String referenceNo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RequestStatus status = RequestStatus.DRAFT;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Priority priority = Priority.ROUTINE;

    private String providerOrg;
    private String payerOrg;
    private String submittedBy;
    private String assignedReviewer;

    // Patient & coverage (PHI — encrypted at rest in production via column converters / Vault).
    private String patientName;
    private String patientDob;
    private String memberId;

    // Clinical detail
    private String serviceRequested;
    @ElementCollection
    @CollectionTable(name = "req_cpt", joinColumns = @JoinColumn(name = "request_id"))
    @Column(name = "code")
    private List<String> cptCodes = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "req_icd10", joinColumns = @JoinColumn(name = "request_id"))
    @Column(name = "code")
    private List<String> icd10Codes = new ArrayList<>();

    private String placeOfService;
    private int requestedUnits = 1;

    @Column(length = 8000)
    private String clinicalJustification;

    @Column(length = 4000)
    private String decisionNote;

    @OneToMany(mappedBy = "request", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ClinicalDocument> documents = new ArrayList<>();

    @OneToMany(mappedBy = "request", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("at ASC")
    private List<TimelineEvent> timeline = new ArrayList<>();

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(nullable = false)
    private Instant updatedAt = Instant.now();

    @PreUpdate
    void touch() { this.updatedAt = Instant.now(); }

    public void addEvent(TimelineEvent e) { e.setRequest(this); timeline.add(e); }
    public void addDocument(ClinicalDocument d) { d.setRequest(this); documents.add(d); }

    // ── getters / setters ───────────────────────────────────────────────────
    public UUID getId() { return id; }
    public String getReferenceNo() { return referenceNo; }
    public void setReferenceNo(String v) { this.referenceNo = v; }
    public RequestStatus getStatus() { return status; }
    public void setStatus(RequestStatus v) { this.status = v; }
    public Priority getPriority() { return priority; }
    public void setPriority(Priority v) { this.priority = v; }
    public String getProviderOrg() { return providerOrg; }
    public void setProviderOrg(String v) { this.providerOrg = v; }
    public String getPayerOrg() { return payerOrg; }
    public void setPayerOrg(String v) { this.payerOrg = v; }
    public String getSubmittedBy() { return submittedBy; }
    public void setSubmittedBy(String v) { this.submittedBy = v; }
    public String getAssignedReviewer() { return assignedReviewer; }
    public void setAssignedReviewer(String v) { this.assignedReviewer = v; }
    public String getPatientName() { return patientName; }
    public void setPatientName(String v) { this.patientName = v; }
    public String getPatientDob() { return patientDob; }
    public void setPatientDob(String v) { this.patientDob = v; }
    public String getMemberId() { return memberId; }
    public void setMemberId(String v) { this.memberId = v; }
    public String getServiceRequested() { return serviceRequested; }
    public void setServiceRequested(String v) { this.serviceRequested = v; }
    public List<String> getCptCodes() { return cptCodes; }
    public void setCptCodes(List<String> v) { this.cptCodes = v; }
    public List<String> getIcd10Codes() { return icd10Codes; }
    public void setIcd10Codes(List<String> v) { this.icd10Codes = v; }
    public String getPlaceOfService() { return placeOfService; }
    public void setPlaceOfService(String v) { this.placeOfService = v; }
    public int getRequestedUnits() { return requestedUnits; }
    public void setRequestedUnits(int v) { this.requestedUnits = v; }
    public String getClinicalJustification() { return clinicalJustification; }
    public void setClinicalJustification(String v) { this.clinicalJustification = v; }
    public String getDecisionNote() { return decisionNote; }
    public void setDecisionNote(String v) { this.decisionNote = v; }
    public List<ClinicalDocument> getDocuments() { return documents; }
    public List<TimelineEvent> getTimeline() { return timeline; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
}
