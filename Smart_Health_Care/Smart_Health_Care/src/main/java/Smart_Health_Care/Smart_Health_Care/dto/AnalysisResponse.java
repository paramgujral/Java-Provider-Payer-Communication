package Smart_Health_Care.Smart_Health_Care.dto;


public class AnalysisResponse {

    private Long claimId;
    private String riskLevel;
    private int fraudProbability;
    private String recommendation;

    public AnalysisResponse() {
    }

    public AnalysisResponse(Long claimId, String riskLevel,
                            int fraudProbability, String recommendation) {
        this.claimId = claimId;
        this.riskLevel = riskLevel;
        this.fraudProbability = fraudProbability;
        this.recommendation = recommendation;
    }

    public Long getClaimId() {
        return claimId;
    }

    public void setClaimId(Long claimId) {
        this.claimId = claimId;
    }

    public String getRiskLevel() {
        return riskLevel;
    }

    public void setRiskLevel(String riskLevel) {
        this.riskLevel = riskLevel;
    }

    public int getFraudProbability() {
        return fraudProbability;
    }

    public void setFraudProbability(int fraudProbability) {
        this.fraudProbability = fraudProbability;
    }

    public String getRecommendation() {
        return recommendation;
    }

    public void setRecommendation(String recommendation) {
        this.recommendation = recommendation;
    }
}
