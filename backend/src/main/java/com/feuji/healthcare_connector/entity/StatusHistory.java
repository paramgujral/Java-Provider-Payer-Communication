package com.feuji.healthcare_connector.entity;

import com.feuji.healthcare_connector.enums.RequestStatus;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "status_history")
public class StatusHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "request_id", nullable = false)
    private AuthorizationRequest request;

    @Enumerated(EnumType.STRING)
    @Column(name = "from_status", length = 20)
    private RequestStatus fromStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "to_status", nullable = false, length = 20)
    private RequestStatus toStatus;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "changed_by", nullable = false)
    private User changedBy;

    @Column(columnDefinition = "TEXT")
    private String remarks;

    @Column(name = "changed_at", nullable = false)
    private LocalDateTime changedAt;

    @PrePersist
    protected void onCreate() {
        changedAt = LocalDateTime.now();
    }

    public StatusHistory() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public AuthorizationRequest getRequest() { return request; }
    public void setRequest(AuthorizationRequest request) { this.request = request; }

    public RequestStatus getFromStatus() { return fromStatus; }
    public void setFromStatus(RequestStatus fromStatus) { this.fromStatus = fromStatus; }

    public RequestStatus getToStatus() { return toStatus; }
    public void setToStatus(RequestStatus toStatus) { this.toStatus = toStatus; }

    public User getChangedBy() { return changedBy; }
    public void setChangedBy(User changedBy) { this.changedBy = changedBy; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }

    public LocalDateTime getChangedAt() { return changedAt; }
    public void setChangedAt(LocalDateTime changedAt) { this.changedAt = changedAt; }
}
