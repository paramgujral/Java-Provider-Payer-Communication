package com.connector.auth.domain;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "authorization_request")
public class AuthorizationRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String reference;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private RequestStatus status = RequestStatus.DRAFT;

    @Column(nullable = false, length = 20)
    private String priority = "NORMAL";

    // Patient
    private String patientMrn;
    @Column(nullable = false) private String patientName;
    private String patientBirthDate;
    private String patientGender;

    // Coverage
    private String memberId;
    @Column(nullable = false) private String payerName;
    private String planName;

    // Ordering provider
    private String providerNpi;
    @Column(nullable = false) private String providerName;
    private String providerOrg;
    private String providerSpecialty;

    // Service context
    private String placeOfService;
    private String serviceStart;
    private String serviceEnd;
    @Lob @Column(columnDefinition = "TEXT") private String clinicalNotes;

    // Cached Copilot summary
    private Integer readinessScore;
    private String predictedOutcome;

    // Payer decision
    @Enumerated(EnumType.STRING) @Column(length = 20)
    private Decision decision;
    @Lob @Column(columnDefinition = "TEXT") private String decisionRationale;
    private String authorizationNumber;
    private String authValidFrom;
    private String authValidTo;

    @Column(nullable = false) private LocalDateTime createdAt = LocalDateTime.now();
    @Column(nullable = false) private LocalDateTime updatedAt = LocalDateTime.now();

    @OneToMany(mappedBy = "request", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("sequenceNo ASC")
    private List<DiagnosisCode> diagnoses = new ArrayList<>();

    @OneToMany(mappedBy = "request", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("sequenceNo ASC")
    private List<ServiceLine> serviceLines = new ArrayList<>();

    @OneToOne(mappedBy = "request", cascade = CascadeType.ALL, orphanRemoval = true)
    private CopilotReview copilotReview;

    @OneToMany(mappedBy = "request", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("createdAt ASC")
    private List<StatusEvent> history = new ArrayList<>();

    // ---- convenience ----
    public void addDiagnosis(DiagnosisCode d) { d.setRequest(this); diagnoses.add(d); }
    public void addServiceLine(ServiceLine s) { s.setRequest(this); serviceLines.add(s); }
    public void addEvent(StatusEvent e) { e.setRequest(this); history.add(e); }

    @PreUpdate public void touch() { this.updatedAt = LocalDateTime.now(); }

    // ---- getters / setters ----
    public Long getId() { return id; }
    public String getReference() { return reference; }
    public void setReference(String reference) { this.reference = reference; }
    public RequestStatus getStatus() { return status; }
    public void setStatus(RequestStatus status) { this.status = status; }
    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }
    public String getPatientMrn() { return patientMrn; }
    public void setPatientMrn(String v) { this.patientMrn = v; }
    public String getPatientName() { return patientName; }
    public void setPatientName(String v) { this.patientName = v; }
    public String getPatientBirthDate() { return patientBirthDate; }
    public void setPatientBirthDate(String v) { this.patientBirthDate = v; }
    public String getPatientGender() { return patientGender; }
    public void setPatientGender(String v) { this.patientGender = v; }
    public String getMemberId() { return memberId; }
    public void setMemberId(String v) { this.memberId = v; }
    public String getPayerName() { return payerName; }
    public void setPayerName(String v) { this.payerName = v; }
    public String getPlanName() { return planName; }
    public void setPlanName(String v) { this.planName = v; }
    public String getProviderNpi() { return providerNpi; }
    public void setProviderNpi(String v) { this.providerNpi = v; }
    public String getProviderName() { return providerName; }
    public void setProviderName(String v) { this.providerName = v; }
    public String getProviderOrg() { return providerOrg; }
    public void setProviderOrg(String v) { this.providerOrg = v; }
    public String getProviderSpecialty() { return providerSpecialty; }
    public void setProviderSpecialty(String v) { this.providerSpecialty = v; }
    public String getPlaceOfService() { return placeOfService; }
    public void setPlaceOfService(String v) { this.placeOfService = v; }
    public String getServiceStart() { return serviceStart; }
    public void setServiceStart(String v) { this.serviceStart = v; }
    public String getServiceEnd() { return serviceEnd; }
    public void setServiceEnd(String v) { this.serviceEnd = v; }
    public String getClinicalNotes() { return clinicalNotes; }
    public void setClinicalNotes(String v) { this.clinicalNotes = v; }
    public Integer getReadinessScore() { return readinessScore; }
    public void setReadinessScore(Integer v) { this.readinessScore = v; }
    public String getPredictedOutcome() { return predictedOutcome; }
    public void setPredictedOutcome(String v) { this.predictedOutcome = v; }
    public Decision getDecision() { return decision; }
    public void setDecision(Decision v) { this.decision = v; }
    public String getDecisionRationale() { return decisionRationale; }
    public void setDecisionRationale(String v) { this.decisionRationale = v; }
    public String getAuthorizationNumber() { return authorizationNumber; }
    public void setAuthorizationNumber(String v) { this.authorizationNumber = v; }
    public String getAuthValidFrom() { return authValidFrom; }
    public void setAuthValidFrom(String v) { this.authValidFrom = v; }
    public String getAuthValidTo() { return authValidTo; }
    public void setAuthValidTo(String v) { this.authValidTo = v; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime v) { this.createdAt = v; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime v) { this.updatedAt = v; }
    public List<DiagnosisCode> getDiagnoses() { return diagnoses; }
    public void setDiagnoses(List<DiagnosisCode> v) { this.diagnoses = v; }
    public List<ServiceLine> getServiceLines() { return serviceLines; }
    public void setServiceLines(List<ServiceLine> v) { this.serviceLines = v; }
    public CopilotReview getCopilotReview() { return copilotReview; }
    public void setCopilotReview(CopilotReview v) { if (v != null) v.setRequest(this); this.copilotReview = v; }
    public List<StatusEvent> getHistory() { return history; }
    public void setHistory(List<StatusEvent> v) { this.history = v; }
}
