package Smart_Health_Care.Smart_Health_Care.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "status_tracking")
public class StatusTracking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long trackingId;

    private Long referenceId;

    // CLAIM or AUTHORIZATION
    private String module;

    // PENDING, APPROVED, REJECTED
    private String status;

    private String remarks;

    private LocalDateTime updatedDate;

    public StatusTracking() {
    }

    public StatusTracking(Long trackingId, Long referenceId, String module,
                          String status, String remarks, LocalDateTime updatedDate) {
        this.trackingId = trackingId;
        this.referenceId = referenceId;
        this.module = module;
        this.status = status;
        this.remarks = remarks;
        this.updatedDate = updatedDate;
    }

    public Long getTrackingId() {
        return trackingId;
    }

    public void setTrackingId(Long trackingId) {
        this.trackingId = trackingId;
    }

    public Long getReferenceId() {
        return referenceId;
    }

    public void setReferenceId(Long referenceId) {
        this.referenceId = referenceId;
    }

    public String getModule() {
        return module;
    }

    public void setModule(String module) {
        this.module = module;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }

    public LocalDateTime getUpdatedDate() {
        return updatedDate;
    }

    public void setUpdatedDate(LocalDateTime updatedDate) {
        this.updatedDate = updatedDate;
    }
}