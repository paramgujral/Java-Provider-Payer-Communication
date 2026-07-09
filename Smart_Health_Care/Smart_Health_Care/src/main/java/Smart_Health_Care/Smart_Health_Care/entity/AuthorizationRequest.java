package Smart_Health_Care.Smart_Health_Care.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name="authorization_request")
public class AuthorizationRequest {
	

	public AuthorizationRequest(Long authorizationId, Long patientId, Long providerId, Long payerId, String diagnosis,
			String procedureCode, double estimatedCost, String status, String comments, LocalDateTime createdDate) {
		super();
		this.authorizationId = authorizationId;
		this.patientId = patientId;
		this.providerId = providerId;
		this.payerId = payerId;
		this.diagnosis = diagnosis;
		this.procedureCode = procedureCode;
		this.estimatedCost = estimatedCost;
		this.status = status;
		this.comments = comments;
		this.createdDate = createdDate;
	}
	@Id
	@GeneratedValue(strategy=GenerationType.IDENTITY)
	private Long authorizationId;
	private Long patientId;
	private Long providerId;
	private Long payerId;
	private String diagnosis;
	private String procedureCode;
	private double estimatedCost;
	private String status;
	private String comments;
	private LocalDateTime createdDate;
	public Long getAuthorizationId() {
		return authorizationId;
	}
	public void setAuthorizationId(Long authorizationId) {
		this.authorizationId = authorizationId;
	}
	public Long getPatientId() {
		return patientId;
	}
	public void setPatientId(Long patientId) {
		this.patientId = patientId;
	}
	public Long getProviderId() {
		return providerId;
	}
	public void setProviderId(Long providerId) {
		this.providerId = providerId;
	}
	public Long getPayerId() {
		return payerId;
	}
	public void setPayerId(Long payerId) {
		this.payerId = payerId;
	}
	public String getDiagnosis() {
		return diagnosis;
	}
	public void setDiagnosis(String diagnosis) {
		this.diagnosis = diagnosis;
	}
	public String getProcedureCode() {
		return procedureCode;
	}
	public void setProcedureCode(String procedureCode) {
		this.procedureCode = procedureCode;
	}
	public double getEstimatedCost() {
		return estimatedCost;
	}
	public void setEstimatedCost(double estimatedCost) {
		this.estimatedCost = estimatedCost;
	}
	public String getStatus() {
		return status;
	}
	public void setStatus(String status) {
		this.status = status;
	}
	public String getComments() {
		return comments;
	}
	public void setComments(String comments) {
		this.comments = comments;
	}
	public LocalDateTime getCreatedDate() {
		return createdDate;
	}
	public void setCreatedDate(LocalDateTime createdDate) {
		this.createdDate = createdDate;
	}
	
	
		

}
