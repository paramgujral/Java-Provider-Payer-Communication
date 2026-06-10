package com.healthconnect.platform.seeder;

import com.healthconnect.platform.dto.request.CreateAuthorizationRequest;
import com.healthconnect.platform.dto.request.ReviewDecisionRequest;
import com.healthconnect.platform.entity.AuthorizationRequest;
import com.healthconnect.platform.entity.User;
import com.healthconnect.platform.enums.RequestStatus;
import com.healthconnect.platform.enums.Role;
import com.healthconnect.platform.repository.AuthorizationRequestRepository;
import com.healthconnect.platform.repository.UserRepository;
import com.healthconnect.platform.service.AuthorizationRequestService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final AuthorizationRequestRepository requestRepository;
    private final AuthorizationRequestService requestService;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.count() > 0) return;

        log.info("Seeding demo data...");

        // ── Users ──────────────────────────────────────────────────────────────
        User provider1 = createUser("provider@healthconnect.com", "Dr. Sarah Mitchell",
                "Metro Health Clinic", "1234567890", Role.PROVIDER);
        User provider2 = createUser("provider2@healthconnect.com", "Dr. James Carter",
                "Riverside Medical Group", "0987654321", Role.PROVIDER);
        User payer1 = createUser("payer@healthconnect.com", "Lisa Johnson",
                "BlueCross Health Insurance", null, Role.PAYER);
        User payer2 = createUser("payer2@healthconnect.com", "Robert Kim",
                "BlueCross Health Insurance", null, Role.PAYER);

        log.info("Created 4 demo users");

        // ── Authorization Requests ─────────────────────────────────────────────
        // 1. APPROVED request
        AuthorizationRequest req1 = seedRequest(provider1,
                "Emily Johnson", "1985-03-15", "BCB-123456", "BlueCross PPO Gold",
                "M54.5", "Low back pain", "97110", "Therapeutic exercises",
                "Outpatient", LocalDate.now().plusDays(7), LocalDate.now().plusDays(21),
                "Spine & Rehab Center", "Dr. Alan Torres",
                "Patient presents with chronic lower back pain following L4-L5 disc herniation confirmed by MRI. " +
                "Conservative treatment including physical therapy recommended. Patient has failed conservative " +
                "management with NSAIDs for 6 weeks. Physical therapy 3x/week for 6 weeks indicated.",
                "MRI Report, Referral Letter, Prior Auth History", "NORMAL");
        approveRequest(req1, payer1, "All clinical criteria met. MRI supports medical necessity.");

        // 2. DENIED request
        AuthorizationRequest req2 = seedRequest(provider1,
                "Michael Torres", "1978-07-22", "BCB-789012", "BlueCross PPO Silver",
                "J45.50", "Unspecified asthma", "99213", "Office visit",
                "Specialist", LocalDate.now().plusDays(3), LocalDate.now().plusDays(3),
                "City Pulmonology", "Dr. Nina Patel",
                "Patient reports worsening asthma symptoms.", null, "NORMAL");
        denyRequest(req2, payer1,
                "Insufficient clinical documentation. Specialist visit not justified without prior primary care " +
                "evaluation and step therapy documentation.");

        // 3. IN_REVIEW
        AuthorizationRequest req3 = seedRequest(provider2,
                "Patricia Williams", "1960-11-30", "BCB-345678", "BlueCross HMO Basic",
                "C50.912", "Unspecified malignant neoplasm of breast", "19301", "Partial mastectomy",
                "Inpatient", LocalDate.now().plusDays(14), LocalDate.now().plusDays(16),
                "St. Mary's Surgical Center", "Dr. Robert Chen",
                "Patient diagnosed with stage II invasive ductal carcinoma of left breast. " +
                "Sentinel lymph node biopsy planned. Surgery recommended after oncology board review. " +
                "Pathology report and imaging attached. Patient is a good surgical candidate with no significant comorbidities.",
                "Pathology Report, CT Scan, Oncology Board Notes, Surgical Plan", "URGENT");
        startReview(req3, payer1);

        // 4. INFO_REQUESTED
        AuthorizationRequest req4 = seedRequest(provider1,
                "David Martinez", "1992-04-18", "BCB-901234", "BlueCross EPO Plus",
                "M17.11", "Primary osteoarthritis, right knee", "27447", "Total knee arthroplasty",
                "Inpatient", LocalDate.now().plusDays(21), LocalDate.now().plusDays(24),
                "Orthopedic Surgery Institute", "Dr. Sandra Lee",
                "Patient has severe right knee osteoarthritis with bone-on-bone contact confirmed on X-ray. " +
                "Has failed 12 months of conservative management including PT, cortisone injections, and NSAIDs.",
                "X-Ray Reports, PT Records", "HIGH");
        requestMoreInfo(req4, payer2,
                "Please provide: 1) Documentation of at least 3 cortisone injections, " +
                "2) Surgical risk assessment, 3) Pre-operative weight loss program completion if BMI > 40");

        // 5. SUBMITTED
        seedRequest(provider2,
                "Jennifer Adams", "1975-09-05", "BCB-567890", "BlueCross PPO Gold",
                "G43.909", "Migraine, unspecified", "70553", "MRI brain with contrast",
                "Outpatient", LocalDate.now().plusDays(5), LocalDate.now().plusDays(5),
                "Neurology Imaging Center", "Dr. Victor Huang",
                "Patient presents with 3-year history of debilitating migraines, 4-6 episodes per month. " +
                "Current medications: Topiramate 100mg, Sumatriptan PRN. Neurological exam normal. " +
                "MRI requested to rule out secondary causes including mass lesion.",
                "Neurology Notes, Medication History, Headache Diary", "NORMAL");

        // 6. DRAFT
        seedRequest(provider1,
                "Robert Chen", "1988-12-01", "BCB-234567", "BlueCross HMO Plus",
                "E11.9", "Type 2 diabetes mellitus without complications", "95251",
                "Continuous glucose monitoring",
                "Outpatient", LocalDate.now().plusDays(10), LocalDate.now().plusDays(10),
                null, null,
                "Patient has Type 2 DM diagnosed 5 years ago. Currently on Metformin 1000mg BID.",
                null, "NORMAL");

        // 7. RESUBMITTED
        AuthorizationRequest req7 = seedRequest(provider2,
                "Karen White", "1955-06-14", "BCB-678901", "BlueCross Senior Care",
                "N18.4", "Chronic kidney disease, stage 4", "90935", "Hemodialysis",
                "Outpatient", LocalDate.now().plusDays(2), LocalDate.now().plusDays(90),
                "Renal Care Center", "Dr. Maria Santos",
                "Patient with Stage 4 CKD, eGFR 18 mL/min. Nephrologist recommends initiation of hemodialysis. " +
                "AV fistula placed 3 months ago, now matured and ready for use. Patient educated on HD schedule.",
                "Nephrology Notes, Lab Results, eGFR Trend, AV Fistula Maturation Report", "URGENT");
        resubmitRequest(req7, provider2);

        log.info("Seeded 7 authorization requests across all statuses");
        log.info("═══════════════════════════════════════════════════════");
        log.info("  Demo credentials:");
        log.info("  Provider:  provider@healthconnect.com  / password123");
        log.info("  Provider2: provider2@healthconnect.com / password123");
        log.info("  Payer:     payer@healthconnect.com     / password123");
        log.info("  Payer2:    payer2@healthconnect.com    / password123");
        log.info("═══════════════════════════════════════════════════════");
    }

    private User createUser(String email, String name, String org, String npi, Role role) {
        User user = User.builder()
                .email(email)
                .password(passwordEncoder.encode("password123"))
                .fullName(name)
                .organization(org)
                .npi(npi)
                .role(role)
                .active(true)
                .build();
        return userRepository.save(user);
    }

    private AuthorizationRequest seedRequest(User provider, String patientName, String dob,
            String memberId, String plan, String diagCode, String diagDesc,
            String procCode, String procDesc, String serviceType,
            LocalDate startDate, LocalDate endDate, String facility,
            String physician, String notes, String docs, String priority) {

        CreateAuthorizationRequest dto = new CreateAuthorizationRequest();
        dto.setPatientName(patientName);
        dto.setPatientDob(dob);
        dto.setPatientMemberId(memberId);
        dto.setPatientInsurancePlan(plan);
        dto.setDiagnosisCode(diagCode);
        dto.setDiagnosisDescription(diagDesc);
        dto.setProcedureCode(procCode);
        dto.setProcedureDescription(procDesc);
        dto.setServiceType(serviceType);
        dto.setRequestedServiceDate(startDate);
        dto.setRequestedServiceEndDate(endDate);
        dto.setFacilityName(facility);
        dto.setTreatingPhysician(physician);
        dto.setClinicalNotes(notes);
        dto.setSupportingDocuments(docs);
        dto.setPriority(priority);

        var response = requestService.createDraft(dto, provider);
        return requestRepository.findById(response.getId()).orElseThrow();
    }

    private void approveRequest(AuthorizationRequest req, User reviewer, String notes) {
        requestService.submitRequest(req.getId(), req.getProvider());
        requestService.startReview(req.getId(), reviewer);
        ReviewDecisionRequest decision = new ReviewDecisionRequest();
        decision.setDecision(ReviewDecisionRequest.Decision.APPROVE);
        decision.setReviewerNotes(notes);
        requestService.processDecision(req.getId(), decision, reviewer);
    }

    private void denyRequest(AuthorizationRequest req, User reviewer, String reason) {
        requestService.submitRequest(req.getId(), req.getProvider());
        requestService.startReview(req.getId(), reviewer);
        ReviewDecisionRequest decision = new ReviewDecisionRequest();
        decision.setDecision(ReviewDecisionRequest.Decision.DENY);
        decision.setDenialReason(reason);
        requestService.processDecision(req.getId(), decision, reviewer);
    }

    private void startReview(AuthorizationRequest req, User reviewer) {
        requestService.submitRequest(req.getId(), req.getProvider());
        requestService.startReview(req.getId(), reviewer);
    }

    private void requestMoreInfo(AuthorizationRequest req, User reviewer, String info) {
        requestService.submitRequest(req.getId(), req.getProvider());
        requestService.startReview(req.getId(), reviewer);
        ReviewDecisionRequest decision = new ReviewDecisionRequest();
        decision.setDecision(ReviewDecisionRequest.Decision.REQUEST_INFO);
        decision.setAdditionalInfoRequested(info);
        requestService.processDecision(req.getId(), decision, reviewer);
    }

    private void resubmitRequest(AuthorizationRequest req, User provider) {
        requestService.submitRequest(req.getId(), provider);

        // Simulate info requested then resubmit
        User payer = userRepository.findByEmail("payer@healthconnect.com").orElseThrow();
        requestService.startReview(req.getId(), payer);
        ReviewDecisionRequest infoReq = new ReviewDecisionRequest();
        infoReq.setDecision(ReviewDecisionRequest.Decision.REQUEST_INFO);
        infoReq.setAdditionalInfoRequested("Please provide latest eGFR results from past 30 days");
        requestService.processDecision(req.getId(), infoReq, payer);

        com.healthconnect.platform.dto.request.ResubmitRequest resubmit =
                new com.healthconnect.platform.dto.request.ResubmitRequest();
        resubmit.setClinicalNotes(req.getClinicalNotes() +
                "\n\nUpdate: Latest eGFR: 16 mL/min (30-day trend shows continued decline). " +
                "Urgent HD initiation indicated.");
        resubmit.setAdditionalInfo("eGFR results attached, confirming HD initiation criteria met");
        requestService.resubmitRequest(req.getId(), resubmit, provider);
    }
}
