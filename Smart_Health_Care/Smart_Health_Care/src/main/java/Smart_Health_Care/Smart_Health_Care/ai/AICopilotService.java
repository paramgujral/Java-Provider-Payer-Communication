package Smart_Health_Care.Smart_Health_Care.ai;

import org.springframework.stereotype.Service;

import Smart_Health_Care.Smart_Health_Care.dto.AnalysisResponse;
import Smart_Health_Care.Smart_Health_Care.entity.AuthorizationRequest;
import Smart_Health_Care.Smart_Health_Care.entity.Claim;

@Service
public class AICopilotService {

    // Review Authorization Request
    public String reviewAuthorizationRequest(AuthorizationRequest request) {

        StringBuilder review = new StringBuilder();

        if (request.getPatientId() == null) {
            review.append("Patient ID is missing.\n");
        }

        if (request.getProviderId() == null) {
            review.append("Provider ID is missing.\n");
        }

        if (request.getPayerId() == null) {
            review.append("Payer ID is missing.\n");
        }

        if (request.getDiagnosis() == null || request.getDiagnosis().isBlank()) {
            review.append("Diagnosis is missing.\n");
        }

        if (request.getProcedureCode() == null || request.getProcedureCode().isBlank()) {
            review.append("Procedure Code is missing.\n");
        }

        if (request.getEstimatedCost() <= 0) {
            review.append("Estimated Cost should be greater than zero.\n");
        }

        if (review.length() == 0) {
            return "Authorization Request is complete and ready for payer review.";
        }

        return review.toString();
    }

    // Generate Summary
    public String generateSummary(AuthorizationRequest request) {

        return "Authorization Request Summary\n"
                + "Patient ID : " + request.getPatientId() + "\n"
                + "Provider ID : " + request.getProviderId() + "\n"
                + "Payer ID : " + request.getPayerId() + "\n"
                + "Diagnosis : " + request.getDiagnosis() + "\n"
                + "Procedure Code : " + request.getProcedureCode() + "\n"
                + "Estimated Cost : ₹" + request.getEstimatedCost();
    }

    // Treatment Suggestion
    public String suggestTreatment(String diagnosis) {

        switch (diagnosis.toLowerCase()) {

            case "diabetes":
                return "Suggested Treatment: Insulin therapy, low sugar diet and regular exercise.";

            case "hypertension":
                return "Suggested Treatment: Antihypertensive medication, low sodium diet and exercise.";

            case "asthma":
                return "Suggested Treatment: Bronchodilator inhaler and avoid allergens.";

            case "fever":
                return "Suggested Treatment: Paracetamol, hydration and adequate rest.";

            case "covid":
                return "Suggested Treatment: Isolation, hydration and antiviral medication if prescribed.";

            default:
                return "Consult a specialist for detailed treatment recommendations.";
        }
       
    }
  public  AnalysisResponse analyzeClaim(Claim claim) {
    	 String riskLevel;
    	    int fraudProbability;
    	    String recommendation;

    	    if (claim.getAmount() > 100000) {
    	        riskLevel = "HIGH";
    	        fraudProbability = 90;
    	        recommendation = "Manual Review Required";
    	    } else if (claim.getAmount() > 50000) {
    	        riskLevel = "MEDIUM";
    	        fraudProbability = 50;
    	        recommendation = "Needs Verification";
    	    } else {
    	        riskLevel = "LOW";
    	        fraudProbability = 10;
    	        recommendation = "Approve";
    	    }

    	    return new AnalysisResponse(
    	            claim.getClaimId(),
    	            riskLevel,
    	            fraudProbability,
    	            recommendation
    	    );
    }
}