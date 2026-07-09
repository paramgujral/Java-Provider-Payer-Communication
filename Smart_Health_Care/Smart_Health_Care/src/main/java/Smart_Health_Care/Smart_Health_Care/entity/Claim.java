package Smart_Health_Care.Smart_Health_Care.entity;

import jakarta.persistence.*;

@Entity
@Table(name="claims")
public class Claim {

    
    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
	private Long claimId;
    private Long patientId;
    private Long providerId;
    private Long payerId;
    private double amount;
    private String diagnosis;
    private String treatment;
    private String status;
    private String rejectionReason;
    
    public Claim() {
    	
    }
    public Claim(Long claimId, Long patientId, Long providerId, Long payerId, double amount, String diagnosis,
			String treatment, String status, String rejectionReason) {
		super();
		this.claimId = claimId;
		this.patientId = patientId;
		this.providerId = providerId;
		this.payerId = payerId;
		this.amount = amount;
		this.diagnosis = diagnosis;
		this.treatment = treatment;
		this.status = status;
		this.rejectionReason = rejectionReason;
	}

    public Long getClaimId() {
    	return claimId;
    }
    
    public void setClaimId(Long claimId) {
    	this.claimId=claimId;
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

	public double getAmount() {
		return amount;
	}

	public void setAmount(double amount) {
		this.amount = amount;
	}

	public String getDiagnosis() {
		return diagnosis;
	}

	public void setDiagnosis(String diagnosis) {
		this.diagnosis = diagnosis;
	}

	public String getTreatment() {
		return treatment;
	}

	public void setTreatment(String treatment) {
		this.treatment = treatment;
	}

	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

	public String getRejectionReason() {
		return rejectionReason;
	}

	public void setRejectionReason(String rejectionReason) {
		this.rejectionReason = rejectionReason;
	}
}
