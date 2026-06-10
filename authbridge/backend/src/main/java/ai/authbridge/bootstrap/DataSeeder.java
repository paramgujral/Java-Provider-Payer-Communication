package ai.authbridge.bootstrap;

import ai.authbridge.domain.Enums.Priority;
import ai.authbridge.domain.Enums.RequestStatus;
import ai.authbridge.service.AuthorizationRequestService;
import ai.authbridge.web.dto.RequestDtos.CreateRequest;
import ai.authbridge.workflow.WorkflowService;
import ai.authbridge.domain.AuthorizationRequest;
import ai.authbridge.domain.Enums.Role;
import java.util.List;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

/** Seeds representative data on startup (dev/demo profiles only) so the API has content to serve. */
@Component
@Profile({"dev", "demo", "default"})
public class DataSeeder implements CommandLineRunner {

    private final AuthorizationRequestService requests;
    private final WorkflowService workflow;

    public DataSeeder(AuthorizationRequestService requests, WorkflowService workflow) {
        this.requests = requests;
        this.workflow = workflow;
    }

    @Override
    public void run(String... args) {
        // 1) MRI lumbar — submitted then picked up for review.
        AuthorizationRequest mri = requests.create(new CreateRequest(
                "MRI lumbar spine without contrast", List.of("72148"), List.of("M54.16"),
                Priority.ROUTINE, "Outpatient Hospital", 1, "Jordan T.", "1979-04-12", "MRD-8841290",
                "Riverside General Hospital", "Meridian Health Plan", "Dr. Alan Grant",
                "Patient reports 10 weeks of radicular low back pain unresponsive to 6 weeks of physical therapy and NSAIDs. Progressive left-leg weakness on exam. MRI requested to evaluate for disc herniation prior to surgical consult.",
                List.of(), RequestStatus.SUBMITTED));
        workflow.transition(mri.getId(), RequestStatus.IN_REVIEW, "P. Sattler · Meridian Health Plan", Role.PAYER, null);

        // 2) Total knee arthroplasty — approved.
        AuthorizationRequest tka = requests.create(new CreateRequest(
                "Total knee arthroplasty", List.of("27447"), List.of("M17.11"),
                Priority.ROUTINE, "Inpatient Hospital", 1, "Robert M.", "1956-02-20", "MRD-5519034",
                "Riverside General Hospital", "Meridian Health Plan", "Dr. Alan Grant",
                "Severe right-knee osteoarthritis. Failed 9 months of conservative management including PT, NSAIDs, and intra-articular injections. Weight-bearing radiographs show bone-on-bone changes. TKA recommended.",
                List.of(), RequestStatus.SUBMITTED));
        workflow.transition(tka.getId(), RequestStatus.IN_REVIEW, "P. Sattler · Meridian Health Plan", Role.PAYER, null);
        workflow.transition(tka.getId(), RequestStatus.APPROVED, "P. Sattler · Meridian Health Plan", Role.PAYER,
                "Approved. Authorization valid 90 days. Auth #MER-77120.");

        // 3) CT angiography — info requested.
        AuthorizationRequest ct = requests.create(new CreateRequest(
                "CT angiography chest", List.of("71275"), List.of("R07.9"),
                Priority.URGENT, "Outpatient Hospital", 1, "Maria S.", "1968-09-03", "MRD-2207781",
                "Riverside General Hospital", "Meridian Health Plan", "Dr. Ellie Sattler",
                "Acute chest pain, rule out PE.", List.of(), RequestStatus.SUBMITTED));
        workflow.transition(ct.getId(), RequestStatus.INFO_REQUESTED, "P. Sattler · Meridian Health Plan", Role.PAYER,
                "Please attach D-dimer result and ECG before review can continue.");
    }
}
