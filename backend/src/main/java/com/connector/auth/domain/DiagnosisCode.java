package com.connector.auth.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
@Table(name = "diagnosis_code")
public class DiagnosisCode {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "request_id")
    @JsonIgnore
    private AuthorizationRequest request;

    private Integer sequenceNo;
    @Column(name = "icd10_code", nullable = false) private String icd10Code;
    private String description;
    private Boolean isPrincipal = false;

    public Long getId() { return id; }
    public AuthorizationRequest getRequest() { return request; }
    public void setRequest(AuthorizationRequest r) { this.request = r; }
    public Integer getSequenceNo() { return sequenceNo; }
    public void setSequenceNo(Integer v) { this.sequenceNo = v; }
    public String getIcd10Code() { return icd10Code; }
    public void setIcd10Code(String v) { this.icd10Code = v; }
    public String getDescription() { return description; }
    public void setDescription(String v) { this.description = v; }
    public Boolean getIsPrincipal() { return isPrincipal; }
    public void setIsPrincipal(Boolean v) { this.isPrincipal = v; }
}
