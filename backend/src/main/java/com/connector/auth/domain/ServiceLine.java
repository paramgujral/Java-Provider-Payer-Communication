package com.connector.auth.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
@Table(name = "service_line")
public class ServiceLine {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "request_id")
    @JsonIgnore
    private AuthorizationRequest request;

    private Integer sequenceNo;
    @Column(name = "cpt_code", nullable = false) private String cptCode;
    private String description;
    private Integer units = 1;
    private String unitType;

    public Long getId() { return id; }
    public AuthorizationRequest getRequest() { return request; }
    public void setRequest(AuthorizationRequest r) { this.request = r; }
    public Integer getSequenceNo() { return sequenceNo; }
    public void setSequenceNo(Integer v) { this.sequenceNo = v; }
    public String getCptCode() { return cptCode; }
    public void setCptCode(String v) { this.cptCode = v; }
    public String getDescription() { return description; }
    public void setDescription(String v) { this.description = v; }
    public Integer getUnits() { return units; }
    public void setUnits(Integer v) { this.units = v; }
    public String getUnitType() { return unitType; }
    public void setUnitType(String v) { this.unitType = v; }
}
