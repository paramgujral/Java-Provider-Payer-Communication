/*package Smart_Health_Care.Smart_Health_Care.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import Smart_Health_Care.Smart_Health_Care.entity.Claim;

@Service
public class NotificationService {
    @Autowired
	private ClaimService claimService;
    public String notifyClaimStatus(Long claimId, String status) {
        Claim claim=claimService.getClaim(claimId);
        return "Notification sent successfully for Claim ID"
                + claim.getClaimId()
                + " status is "
                + claim.getStatus();
    }
}*/

package Smart_Health_Care.Smart_Health_Care.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import Smart_Health_Care.Smart_Health_Care.entity.Claim;

@Service
public class NotificationService {

    @Autowired
    private ClaimService claimService;

    public String sendEmail(String email, String subject, String message) {

        return "Email sent successfully to " + email;
    }

    public String notifyClaimStatus(Long claimId, String status) {

        Claim claim = claimService.getClaim(claimId);

        return "Notification sent successfully for Claim ID "
                + claim.getClaimId()
                + ". Current Status: "
                + claim.getStatus();
    }

    public String claimApproved(String email) {

        return "Claim approval notification sent to " + email;
    }

    public String claimRejected(String email, String reason) {

        return "Claim rejection notification sent to "
                + email
                + ". Reason: "
                + reason;
    }

}