package Smart_Health_Care.Smart_Health_Care.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import Smart_Health_Care.Smart_Health_Care.entity.Claim;
import Smart_Health_Care.Smart_Health_Care.service.ClaimService;
import Smart_Health_Care.Smart_Health_Care.service.NotificationService;

@RestController
@RequestMapping("/notification")
@CrossOrigin(origins = "http://localhost:4200")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private ClaimService claimService;

    // Generic Email
    @PostMapping("/send")
    public String send(@RequestParam String email,
                       @RequestParam String subject,
                       @RequestParam String message) {

        return notificationService.sendEmail(email, subject, message);
    }

    // Claim Approved
    @PostMapping("/claim/approved")
    public String claimApproved(@RequestParam String email) {

        return notificationService.claimApproved(email);
    }

    // Claim Rejected
    @PostMapping("/claim/rejected")
    public String claimRejected(@RequestParam String email,
                                @RequestParam String reason) {

        return notificationService.claimRejected(email, reason);
    }

    // Notify Claim Status
    @GetMapping("/{claimId}/notify")
    public String notifyStatus(@PathVariable Long claimId) {

        Claim claim = claimService.getClaim(claimId);

        return notificationService.notifyClaimStatus(
                claimId,
                claim.getStatus()
        );
    }
}