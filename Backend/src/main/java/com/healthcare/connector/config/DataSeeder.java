package com.healthcare.connector.config;

import com.healthcare.connector.auth.entity.User;
import com.healthcare.connector.auth.enums.UserRole;
import com.healthcare.connector.auth.repository.UserRepository;
import com.healthcare.connector.authorization.entity.AuthorizationRequest;
import com.healthcare.connector.authorization.entity.StatusHistory;
import com.healthcare.connector.authorization.enums.AuthorizationStatus;
import com.healthcare.connector.authorization.enums.Priority;
import com.healthcare.connector.authorization.repository.AuthorizationRequestRepository;
import com.healthcare.connector.authorization.repository.StatusHistoryRepository;
import com.healthcare.connector.notification.entity.Notification;
import com.healthcare.connector.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository                 userRepo;
    private final AuthorizationRequestRepository authRepo;
    private final StatusHistoryRepository statusHistoryRepo;
    private final NotificationRepository notificationRepo;
    private final PasswordEncoder                encoder;

    @Override
    public void run(String... args) {
        if (userRepo.count() > 0) return;
        log.info("Seeding ClearPath demo data...");

        // ── Users ──
        User drRamaRao      = saveProvider("provider1", "Dr. Rama Rao Venkatesh",   "dr.ramarao@nims.ac.in",          "1234567890", "NIMS - Nizam's Institute of Medical Sciences, Hyderabad");
        User drPadmavathi   = saveProvider("provider2", "Dr. Padmavathi Reddy",     "padmavathi.reddy@apollohyd.com", "2345678901", "Apollo Hospitals, Jubilee Hills, Hyderabad");
        User drSrinivasRao  = saveProvider("provider3", "Dr. Srinivas Rao Kunduri", "srinivas.kunduri@kims.com",      "3456789012", "KIMS Hospital, Secunderabad");
        User drAnuradha     = saveProvider("provider4", "Dr. Anuradha Naidu",       "anuradha.naidu@care.com",        "4567890123", "CARE Hospitals, Banjara Hills, Hyderabad");
        User drVenkataReddy = saveProvider("provider5", "Dr. Venkata Reddy Bonam",  "v.reddy@gunturhospital.com",     "5678901234", "Guntur Government General Hospital, Guntur");
        User drLakshmi      = saveProvider("provider6", "Dr. Lakshmi Prasanna",     "l.prasanna@vijayawada.com",      "6789012345", "Andhra Hospitals, Vijayawada");

        User payerArogyasri = savePayer("payer1", "Suresh Kumar Yellapragada", "suresh.k@arogyasri.telangana.gov.in", "AROG-TS-001", "Aarogyasri Health Care Trust, Telangana");
        User payerNTRVaidya = savePayer("payer2", "Vijaya Lakshmi Devi",       "vijaya.l@ntrvaidyaseva.ap.gov.in",    "NTR-AP-001",  "NTR Vaidya Seva, Andhra Pradesh");
        User payerStar      = savePayer("payer3", "Rajesh Goud",               "rajesh.goud@starhealth.in",           "STAR-001",    "Star Health and Allied Insurance");
        User payerUnited    = savePayer("payer4", "Meenakshi Sundaram",        "m.sundaram@unitedhealth.in",          "UHI-001",     "United Health Insurance");

        // ── Authorization Requests ──

        // 1. DRAFT
        AuthorizationRequest r1 = save(
                "AUTH-20240601-DR001", drRamaRao, payerArogyasri,
                "P-HYD-001", "Ravi Shankar Goud", "1985-03-14", "AROG-MBR-10023", "PLAN-TS-GOLD",
                "M54.50", "Low back pain, unspecified", "27096", "Injection, sacroiliac joint",
                "Outpatient Pain Management", "21", 3,
                LocalDate.of(2024,7,10), LocalDate.of(2024,7,10), Priority.ROUTINE, AuthorizationStatus.DRAFT,
                "Patient presents with chronic low back pain radiating to left leg for 6 months. Conservative management with physiotherapy and NSAIDs has been tried for 3 months without adequate relief. MRI lumbar spine shows L4-L5 disc herniation with foraminal stenosis. Requesting sacroiliac joint injection for pain management.",
                false, null, null, null,
                null, null, null, null, null, null, null,
                LocalDateTime.of(2024,6,1,9,30), null, null, LocalDate.of(2024,8,1)
        );
        hist(r1, null, AuthorizationStatus.DRAFT, "provider1", "Initial draft created");

        // 2. AI_REVIEWED — high confidence
        AuthorizationRequest r2 = save(
                "AUTH-20240602-AI002", drPadmavathi, payerStar,
                "P-HYD-002", "Sujatha Rani Kotha", "1972-08-22", "STAR-MBR-20045", "PLAN-STAR-SILVER",
                "N18.3", "Chronic kidney disease, stage 3", "90935", "Hemodialysis, one evaluation by a physician",
                "Inpatient Nephrology", "21", 12,
                LocalDate.of(2024,7,15), LocalDate.of(2024,9,15), Priority.URGENT, AuthorizationStatus.AI_REVIEWED,
                "Patient is a 51-year-old female with CKD stage 3 secondary to hypertensive nephropathy. eGFR has declined from 42 to 31 ml/min/1.73m2 over past 6 months. Current medications: Amlodipine 5mg, Telmisartan 40mg, Erythropoietin injections. Creatinine 2.8 mg/dL, Urea 68 mg/dL. Requesting hemodialysis sessions thrice weekly. Nephrology consultation by Dr. Padmavathi Reddy, DM Nephrology.",
                true,
                "High likelihood of approval. Diagnosis code N18.3 aligns well with requested hemodialysis procedure. Clinical notes are comprehensive with lab values supporting medical necessity. Ensure prior hemodialysis records are attached.",
                87,
                List.of("Attach recent eGFR trend chart (last 6 months)", "Include nephrologist recommendation letter", "Confirm dialysis centre is a Star Health network provider"),
                null, null, null, null, null, null, null,
                LocalDateTime.of(2024,6,2,11,0), LocalDateTime.of(2024,6,2,11,45), null, LocalDate.of(2024,9,30)
        );
        hist(r2, null, AuthorizationStatus.DRAFT, "provider2", "Initial draft");
        hist(r2, AuthorizationStatus.DRAFT, AuthorizationStatus.AI_REVIEWED, "AI_COPILOT", "AI Copilot review completed — confidence 87%");

        // 3. SUBMITTED
        AuthorizationRequest r3 = save(
                "AUTH-20240603-SB003", drSrinivasRao, payerArogyasri,
                "P-SEC-003", "Narasimha Rao Pelluri", "1960-11-05", "AROG-MBR-30067", "PLAN-TS-SILVER",
                "I25.10", "Atherosclerotic heart disease, unspecified", "92928", "Percutaneous transcatheter placement of intracoronary stent(s)",
                "Inpatient Cardiology", "21", 1,
                LocalDate.of(2024,7,20), LocalDate.of(2024,7,22), Priority.URGENT, AuthorizationStatus.SUBMITTED,
                "Patient is a 63-year-old male with known CAD, presenting with unstable angina. ECG shows ST depression in leads V4-V6. Troponin I: 0.8 ng/mL (elevated). Echocardiogram: EF 45%, regional wall motion abnormality in LAD territory. Coronary angiography shows 80% stenosis in LAD. Cardiac surgery team recommends PCI with stent placement. Patient is on dual antiplatelet therapy (Aspirin + Clopidogrel).",
                true,
                "Strong clinical documentation supporting urgent PCI. Diagnosis and procedure codes are correctly matched. Troponin elevation and ECG changes provide clear evidence of ACS. Ready for submission.",
                92,
                List.of("Attach coronary angiography report", "Include cardiologist operative plan"),
                null, null, null, null, null, null, null,
                LocalDateTime.of(2024,6,3,8,0), LocalDateTime.of(2024,6,3,8,30), LocalDateTime.of(2024,6,3,9,0), LocalDate.of(2024,8,3)
        );
        hist(r3, null, AuthorizationStatus.DRAFT, "provider3", "Created");
        hist(r3, AuthorizationStatus.DRAFT, AuthorizationStatus.AI_REVIEWED, "AI_COPILOT", "AI review — confidence 92%");
        hist(r3, AuthorizationStatus.AI_REVIEWED, AuthorizationStatus.SUBMITTED, "provider3", "Submitted to Aarogyasri");

        // 4. UNDER_REVIEW
        AuthorizationRequest r4 = save(
                "AUTH-20240604-UR004", drAnuradha, payerNTRVaidya,
                "P-HYD-004", "Sunitha Devi Manthena", "1978-06-30", "NTR-MBR-40089", "PLAN-AP-GOLD",
                "C50.911", "Malignant neoplasm of unspecified site of right female breast", "19307", "Mastectomy, modified radical",
                "Inpatient Oncology Surgery", "21", 1,
                LocalDate.of(2024,7,25), LocalDate.of(2024,7,28), Priority.URGENT, AuthorizationStatus.UNDER_REVIEW,
                "Patient is a 46-year-old female diagnosed with invasive ductal carcinoma of right breast, Grade II. Biopsy result: ER positive, PR positive, HER2 negative. MRI breast shows 3.2cm mass in upper outer quadrant with no axillary involvement. PET scan: No distant metastasis. Stage IIA (T2N0M0). Multidisciplinary tumor board recommends modified radical mastectomy followed by adjuvant chemotherapy. Patient has been counselled regarding surgical options including breast conservation.",
                true,
                "Well-documented oncology case. Staging information and MDT recommendation are in place. Diagnosis-procedure match is appropriate. High probability of approval given clear malignancy documentation.",
                89,
                List.of("Include oncology tumor board meeting notes", "Attach complete biopsy histopathology report"),
                null, null, null, null, null, null, null,
                LocalDateTime.of(2024,6,4,10,0), LocalDateTime.of(2024,6,4,10,20), LocalDateTime.of(2024,6,4,11,0), LocalDate.of(2024,8,4)
        );
        hist(r4, null, AuthorizationStatus.DRAFT, "provider4", "Created");
        hist(r4, AuthorizationStatus.DRAFT, AuthorizationStatus.AI_REVIEWED, "AI_COPILOT", "AI review — confidence 89%");
        hist(r4, AuthorizationStatus.AI_REVIEWED, AuthorizationStatus.SUBMITTED, "provider4", "Submitted to NTR Vaidya Seva");
        hist(r4, AuthorizationStatus.SUBMITTED, AuthorizationStatus.UNDER_REVIEW, "payer2", "Assigned to clinical reviewer Dr. Krishnamurthy");

        // 5. APPROVED — routine surgery
        AuthorizationRequest r5 = save(
                "AUTH-20240510-AP005", drRamaRao, payerArogyasri,
                "P-HYD-005", "Kondaiah Velpula", "1955-01-18", "AROG-MBR-50112", "PLAN-TS-GOLD",
                "K80.20", "Calculus of gallbladder without cholecystitis", "47562", "Laparoscopic cholecystectomy",
                "Inpatient General Surgery", "21", 1,
                LocalDate.of(2024,6,5), LocalDate.of(2024,6,6), Priority.ROUTINE, AuthorizationStatus.APPROVED,
                "Patient is a 69-year-old male presenting with recurrent right hypochondriac pain after meals. USG abdomen: multiple gallstones, largest 1.8cm, with gallbladder wall thickening. LFTs normal. No evidence of common bile duct dilation. Anaesthesia fitness: ASA Grade II. Surgeon: Dr. Rama Rao Venkatesh, MS General Surgery. Requesting laparoscopic cholecystectomy under general anaesthesia.",
                true,
                "Routine cholecystectomy with clear surgical indication. Documentation complete. Approved.",
                95,
                List.of("Confirmed network hospital", "Anaesthesia clearance attached"),
                "APPROVED", "AROG-AUTH-2024-005892",
                "Medically necessary. Laparoscopic cholecystectomy approved as per Aarogyasri surgical guidelines.",
                "Please ensure pre-operative anaesthesia review is completed on day of admission.",
                LocalDate.of(2024,6,5), LocalDate.of(2024,6,6), 1,
                LocalDateTime.of(2024,5,10,9,0), LocalDateTime.of(2024,5,10,9,30), LocalDateTime.of(2024,5,10,11,0), LocalDate.of(2024,7,5)
        );
        hist(r5, null, AuthorizationStatus.DRAFT, "provider1", "Created");
        hist(r5, AuthorizationStatus.DRAFT, AuthorizationStatus.AI_REVIEWED, "AI_COPILOT", "AI review — confidence 95%");
        hist(r5, AuthorizationStatus.AI_REVIEWED, AuthorizationStatus.SUBMITTED, "provider1", "Submitted");
        hist(r5, AuthorizationStatus.SUBMITTED, AuthorizationStatus.UNDER_REVIEW, "payer1", "Assigned to reviewer");
        hist(r5, AuthorizationStatus.UNDER_REVIEW, AuthorizationStatus.APPROVED, "payer1", "Approved — medically necessary");

        // 6. APPROVED — orthopaedic TKR
        AuthorizationRequest r6 = save(
                "AUTH-20240512-AP006", drSrinivasRao, payerStar,
                "P-SEC-006", "Bhavani Prasad Thota", "1968-09-12", "STAR-MBR-60134", "PLAN-STAR-GOLD",
                "M17.11", "Primary osteoarthritis, right knee", "27447", "Arthroplasty, knee, condyle and plateau",
                "Inpatient Orthopaedics", "21", 1,
                LocalDate.of(2024,6,18), LocalDate.of(2024,6,21), Priority.ROUTINE, AuthorizationStatus.APPROVED,
                "Patient is a 55-year-old male with severe bilateral knee osteoarthritis, right > left. VAS pain score: 8/10. KOOS score: 28 (severe). X-ray both knees: Grade IV OA changes, bone-on-bone articulation in right knee. Conservative management for 18 months failed. Physiotherapy, intra-articular steroids, and hyaluronic acid injections tried. Orthopaedic surgeon recommends right total knee replacement. Pre-op: Cardiologist clearance obtained, HbA1c 6.8%, BP controlled.",
                true,
                "Comprehensive documentation for elective TKR. All conservative treatments documented. Approved.",
                91,
                List.of("Confirm implant brand is Star Health empanelled"),
                "APPROVED", "STAR-AUTH-2024-006741",
                "Total knee replacement medically justified. All pre-operative criteria met.",
                "Implant must be from approved Star Health vendor list. Post-op physiotherapy pre-approved for 12 sessions.",
                LocalDate.of(2024,6,18), LocalDate.of(2024,6,21), 1,
                LocalDateTime.of(2024,5,12,14,0), LocalDateTime.of(2024,5,12,14,30), LocalDateTime.of(2024,5,13,10,0), LocalDate.of(2024,7,18)
        );
        hist(r6, null, AuthorizationStatus.DRAFT, "provider3", "Created");
        hist(r6, AuthorizationStatus.DRAFT, AuthorizationStatus.AI_REVIEWED, "AI_COPILOT", "AI review — confidence 91%");
        hist(r6, AuthorizationStatus.AI_REVIEWED, AuthorizationStatus.SUBMITTED, "provider3", "Submitted");
        hist(r6, AuthorizationStatus.SUBMITTED, AuthorizationStatus.UNDER_REVIEW, "payer3", "Under review");
        hist(r6, AuthorizationStatus.UNDER_REVIEW, AuthorizationStatus.APPROVED, "payer3", "Approved");

        // 7. PARTIALLY_APPROVED — psychotherapy, fewer sessions
        AuthorizationRequest r7 = save(
                "AUTH-20240515-PA007", drLakshmi, payerNTRVaidya,
                "P-VJA-007", "Nagamani Gottipati", "1980-04-25", "NTR-MBR-70156", "PLAN-AP-SILVER",
                "F32.1", "Major depressive disorder, single episode, moderate", "90837", "Psychotherapy, 60 minutes with patient",
                "Outpatient Psychiatry", "11", 24,
                LocalDate.of(2024,7,1), LocalDate.of(2024,12,31), Priority.ROUTINE, AuthorizationStatus.PARTIALLY_APPROVED,
                "Patient is a 44-year-old female presenting with 6-month history of depressed mood, anhedonia, sleep disturbance, and reduced appetite. PHQ-9 score: 14 (moderate depression). No prior psychiatric history. Not on any antidepressants. Requesting 24 sessions of individual psychotherapy over 6 months with Dr. Lakshmi Prasanna, MD Psychiatry. Patient refuses pharmacotherapy due to side-effect concerns.",
                true,
                "Psychotherapy request is clinically appropriate. However, 24 sessions may exceed standard policy limit. Expect partial approval for initial treatment phase with option to extend.",
                72,
                List.of("Include GAF score baseline", "Provide treatment plan with measurable goals", "Justify refusal of pharmacotherapy"),
                "PARTIALLY_APPROVED", "NTR-AUTH-2024-007234",
                "Initial 12 sessions approved (3 months). Extension request may be submitted after reassessment at session 10.",
                "Please submit reassessment at session 10 with updated PHQ-9 and treatment response for extension consideration.",
                LocalDate.of(2024,7,1), LocalDate.of(2024,9,30), 12,
                LocalDateTime.of(2024,5,15,16,0), LocalDateTime.of(2024,5,15,16,30), LocalDateTime.of(2024,5,16,12,0), LocalDate.of(2024,10,15)
        );
        hist(r7, null, AuthorizationStatus.DRAFT, "provider6", "Created");
        hist(r7, AuthorizationStatus.DRAFT, AuthorizationStatus.AI_REVIEWED, "AI_COPILOT", "AI review — confidence 72%");
        hist(r7, AuthorizationStatus.AI_REVIEWED, AuthorizationStatus.SUBMITTED, "provider6", "Submitted");
        hist(r7, AuthorizationStatus.SUBMITTED, AuthorizationStatus.UNDER_REVIEW, "payer2", "Under review");
        hist(r7, AuthorizationStatus.UNDER_REVIEW, AuthorizationStatus.PARTIALLY_APPROVED, "payer2", "Partially approved — 12 of 24 sessions");

        // 8. DENIED — conservative criteria not met
        AuthorizationRequest r8 = save(
                "AUTH-20240518-DN008", drVenkataReddy, payerArogyasri,
                "P-GNT-008", "Ramakrishna Rao Nanduri", "1975-12-03", "AROG-MBR-80178", "PLAN-TS-BRONZE",
                "M47.812", "Spondylosis with radiculopathy, lumbar region", "22612", "Arthrodesis, posterior technique, single level; lumbar",
                "Inpatient Spine Surgery", "21", 1,
                LocalDate.of(2024,7,8), LocalDate.of(2024,7,11), Priority.ROUTINE, AuthorizationStatus.DENIED,
                "Patient is a 48-year-old male with chronic low back pain and left leg radiculopathy for 2 years. MRI shows L4-L5 disc degeneration with moderate foraminal stenosis. Requesting lumbar fusion surgery. Physiotherapy attempted for 4 weeks (patient reports non-compliance). No epidural steroid injections tried. No formal pain management programme completed.",
                true,
                "Lumbar fusion request is premature. Aarogyasri guidelines require 6 months of conservative management including physiotherapy and at least 2 epidural injections before fusion is considered. Denial is likely without additional documentation.",
                28,
                List.of("Complete 6 months of supervised physiotherapy first", "Document at least 2 epidural steroid injection attempts", "Include pain management specialist referral notes", "Provide ODI (Oswestry Disability Index) score"),
                "DENIED", null,
                "Prior authorization denied. Clinical criteria for lumbar fusion not met. Conservative management (minimum 6 months physiotherapy + 2 epidural injections) not completed per Aarogyasri Surgical Guidelines Section 4.2.",
                "Provider may resubmit after completion of mandatory conservative management programme. Appeal rights: Provider may appeal within 30 days with additional clinical documentation.",
                null, null, null,
                LocalDateTime.of(2024,5,18,10,0), LocalDateTime.of(2024,5,18,10,30), LocalDateTime.of(2024,5,20,15,0), LocalDate.of(2024,7,18)
        );
        hist(r8, null, AuthorizationStatus.DRAFT, "provider5", "Created");
        hist(r8, AuthorizationStatus.DRAFT, AuthorizationStatus.AI_REVIEWED, "AI_COPILOT", "AI review — confidence 28% — conservative criteria not met");
        hist(r8, AuthorizationStatus.AI_REVIEWED, AuthorizationStatus.SUBMITTED, "provider5", "Submitted despite AI warnings");
        hist(r8, AuthorizationStatus.SUBMITTED, AuthorizationStatus.UNDER_REVIEW, "payer1", "Assigned to clinical reviewer");
        hist(r8, AuthorizationStatus.UNDER_REVIEW, AuthorizationStatus.DENIED, "payer1", "Denied — conservative management criteria not met");

        // 9. DENIED — non-covered procedure, code mismatch
        AuthorizationRequest r9 = save(
                "AUTH-20240520-DN009", drPadmavathi, payerUnited,
                "P-HYD-009", "Swetha Reddy Anumula", "1990-07-14", "UHI-MBR-90200", "PLAN-UHI-BASIC",
                "H52.13", "Myopia, bilateral", "66984", "Extracapsular cataract removal with insertion of IOL prosthesis",
                "Outpatient Ophthalmology", "22", 2,
                LocalDate.of(2024,7,12), LocalDate.of(2024,7,12), Priority.ROUTINE, AuthorizationStatus.DENIED,
                "Patient is a 33-year-old female with high myopia (-9.50D right, -9.25D left). Requesting bilateral clear lens extraction with IOL implantation for refractive correction. BCVA: 6/6 with correction. No cataracts present. Surgeon: Dr. Padmavathi Reddy, MS Ophthalmology.",
                true,
                "This request is for refractive surgery on a non-cataractous eye. Denial is highly likely. Diagnosis code H52.13 (myopia) with procedure code 66984 (cataract extraction with IOL) is a mismatch — 66984 is for cataracts, not refractive correction.",
                12,
                List.of("Procedure code 66984 is for cataract surgery — use refractive procedure code instead", "Clear lens extraction for refractive purposes is typically a non-covered benefit", "Verify if patient's plan covers elective refractive procedures"),
                "DENIED", null,
                "Denied. Clear lens extraction for refractive correction (myopia) is a non-covered benefit under UHI Basic Plan. Procedure 66984 is payable only for visually significant cataracts (VA worse than 6/60 without correction). Patient's BCVA is 6/6 with correction.",
                "Patient may explore self-pay options. If patient develops visually significant cataracts in future, resubmit with appropriate documentation showing VA < 6/60 without correction.",
                null, null, null,
                LocalDateTime.of(2024,5,20,14,0), LocalDateTime.of(2024,5,20,14,20), LocalDateTime.of(2024,5,21,11,0), LocalDate.of(2024,7,20)
        );
        hist(r9, null, AuthorizationStatus.DRAFT, "provider2", "Created");
        hist(r9, AuthorizationStatus.DRAFT, AuthorizationStatus.AI_REVIEWED, "AI_COPILOT", "AI review — confidence 12% — non-covered procedure likely");
        hist(r9, AuthorizationStatus.AI_REVIEWED, AuthorizationStatus.SUBMITTED, "provider2", "Submitted");
        hist(r9, AuthorizationStatus.SUBMITTED, AuthorizationStatus.DENIED, "payer4", "Denied — non-covered benefit");

        // 10. PENDING_INFO — missing diagnostics
        AuthorizationRequest r10 = save(
                "AUTH-20240522-PI010", drAnuradha, payerStar,
                "P-HYD-010", "Prasad Rao Chaganti", "1962-02-28", "STAR-MBR-10022", "PLAN-STAR-SILVER",
                "E11.65", "Type 2 diabetes mellitus with hyperglycemia", "93458", "Catheterization, heart, left; with coronary angiography",
                "Inpatient Cardiology", "21", 1,
                LocalDate.of(2024,7,18), LocalDate.of(2024,7,18), Priority.URGENT, AuthorizationStatus.PENDING_INFO,
                "Patient is a 62-year-old male diabetic with exertional chest pain for 3 months. TMT positive at 7 METs. Echo shows mild LV dysfunction (EF 48%). Requesting coronary angiography to evaluate for CAD. Current medications: Metformin, Glimepiride, Aspirin, Atorvastatin.",
                true,
                "Coronary angiography request is reasonable for diabetic patient with positive stress test. However, additional documentation may be requested by payer.",
                68,
                List.of("Attach TMT report with full details", "Include Holter monitor report if available", "Provide detailed medication history"),
                "PENDING_INFO", null, null,
                "Please provide the following within 7 days: 1) Full TMT report with Bruce protocol stages completed and reason for termination. 2) Recent HbA1c and lipid profile (within 3 months). 3) Cardiologist referral letter. 4) Any prior cardiac catheterization or imaging reports.",
                null, null, null,
                LocalDateTime.of(2024,5,22,9,0), LocalDateTime.of(2024,5,22,9,45), LocalDateTime.of(2024,5,23,14,0), LocalDate.of(2024,7,22)
        );
        hist(r10, null, AuthorizationStatus.DRAFT, "provider4", "Created");
        hist(r10, AuthorizationStatus.DRAFT, AuthorizationStatus.AI_REVIEWED, "AI_COPILOT", "AI review — confidence 68%");
        hist(r10, AuthorizationStatus.AI_REVIEWED, AuthorizationStatus.SUBMITTED, "provider4", "Submitted");
        hist(r10, AuthorizationStatus.SUBMITTED, AuthorizationStatus.UNDER_REVIEW, "payer3", "Assigned to reviewer");
        hist(r10, AuthorizationStatus.UNDER_REVIEW, AuthorizationStatus.PENDING_INFO, "payer3", "Additional documentation requested");

        // 11. PENDING_INFO — paediatric tonsillectomy
        AuthorizationRequest r11 = save(
                "AUTH-20240523-PI011", drRamaRao, payerNTRVaidya,
                "P-HYD-011", "Master Arjun Yadav", "2018-05-10", "NTR-MBR-11034", "PLAN-AP-GOLD",
                "J35.01", "Chronic tonsillitis", "42821", "Tonsillectomy and adenoidectomy, under age 12",
                "Outpatient ENT Surgery", "22", 1,
                LocalDate.of(2024,7,22), LocalDate.of(2024,7,22), Priority.ROUTINE, AuthorizationStatus.PENDING_INFO,
                "Patient is a 6-year-old male with recurrent tonsillitis — 7 episodes in the past 12 months. Each episode treated with antibiotics (Amoxicillin). Parents report difficulty swallowing, snoring, and sleep-disordered breathing. ENT examination: Grade III tonsils bilaterally, adenoid hypertrophy on X-ray. Paradise criteria met (7 episodes/year). Requesting tonsillectomy and adenoidectomy.",
                true,
                "Paediatric tonsillectomy with clear Paradise criteria documentation. Good confidence.",
                78,
                List.of("Attach all antibiotic prescription records for each episode", "Include sleep study if available"),
                "PENDING_INFO", null, null,
                "Please provide: 1) Documented records of all 7 tonsillitis episodes with dates and antibiotic prescriptions. 2) Growth chart and weight for anaesthesia planning. 3) Paediatric anaesthesia fitness certificate. 4) Parental consent form.",
                null, null, null,
                LocalDateTime.of(2024,5,23,11,0), LocalDateTime.of(2024,5,23,11,20), LocalDateTime.of(2024,5,24,10,0), LocalDate.of(2024,7,23)
        );
        hist(r11, null, AuthorizationStatus.DRAFT, "provider1", "Created");
        hist(r11, AuthorizationStatus.DRAFT, AuthorizationStatus.AI_REVIEWED, "AI_COPILOT", "AI review — confidence 78%");
        hist(r11, AuthorizationStatus.AI_REVIEWED, AuthorizationStatus.SUBMITTED, "provider1", "Submitted");
        hist(r11, AuthorizationStatus.SUBMITTED, AuthorizationStatus.PENDING_INFO, "payer2", "Additional documentation required");

        // 12. CANCELLED — submitted in error
        AuthorizationRequest r12 = save(
                "AUTH-20240525-CN012", drLakshmi, payerUnited,
                "P-VJA-012", "Sarada Devi Movva", "1945-11-20", "UHI-MBR-12056", "PLAN-UHI-SENIOR",
                "N40.1", "Benign prostatic hyperplasia with LUTS", "52601", "Transurethral electrosurgical resection of prostate",
                "Inpatient Urology", "21", 1,
                LocalDate.of(2024,6,28), LocalDate.of(2024,6,29), Priority.ROUTINE, AuthorizationStatus.CANCELLED,
                "Request submitted in error — wrong patient demographics. TURP is a male procedure. Will be resubmitted with correct patient.",
                false, null, null, null,
                null, null, null, null, null, null, null,
                LocalDateTime.of(2024,5,25,15,0), null, null, LocalDate.of(2024,7,25)
        );
        hist(r12, null, AuthorizationStatus.DRAFT, "provider6", "Created");
        hist(r12, AuthorizationStatus.DRAFT, AuthorizationStatus.CANCELLED, "provider6", "Cancelled — submitted in error, wrong patient demographics");

        // 13. EXPIRED — never decided within validity
        AuthorizationRequest r13 = save(
                "AUTH-20240101-EX013", drVenkataReddy, payerArogyasri,
                "P-GNT-013", "Hanumantha Rao Boddupalli", "1958-07-04", "AROG-MBR-13078", "PLAN-TS-SILVER",
                "K57.30", "Diverticulosis of large intestine without perforation", "44145", "Colectomy, partial; with colostomy",
                "Inpatient General Surgery", "21", 1,
                LocalDate.of(2024,2,15), LocalDate.of(2024,2,17), Priority.ROUTINE, AuthorizationStatus.EXPIRED,
                "Patient with chronic diverticulosis, recurrent attacks. Elective colectomy planned.",
                true, "Standard elective colectomy. Documentation is adequate.", 80,
                List.of("Request colonoscopy report"),
                null, null, null, null, null, null, null,
                LocalDateTime.of(2024,1,1,9,0), LocalDateTime.of(2024,1,1,9,30), LocalDateTime.of(2024,1,1,10,0), LocalDate.of(2024,2,1)
        );
        hist(r13, null, AuthorizationStatus.DRAFT, "provider5", "Created");
        hist(r13, AuthorizationStatus.DRAFT, AuthorizationStatus.AI_REVIEWED, "AI_COPILOT", "AI review — confidence 80%");
        hist(r13, AuthorizationStatus.AI_REVIEWED, AuthorizationStatus.SUBMITTED, "provider5", "Submitted");
        hist(r13, AuthorizationStatus.SUBMITTED, AuthorizationStatus.EXPIRED, "SYSTEM", "Authorization expired — no decision within validity period");

        // 14. APPROVED — STAT emergency, craniotomy
        AuthorizationRequest r14 = save(
                "AUTH-20240601-ST014", drSrinivasRao, payerStar,
                "P-SEC-014", "Kishore Kumar Alapati", "1982-10-08", "STAR-MBR-14090", "PLAN-STAR-GOLD",
                "I61.9", "Nontraumatic intracerebral hemorrhage, unspecified", "61312", "Craniectomy for evacuation of hematoma",
                "Emergency Neurosurgery", "23", 1,
                LocalDate.of(2024,6,1), LocalDate.of(2024,6,4), Priority.STAT, AuthorizationStatus.APPROVED,
                "Patient is a 41-year-old male brought to emergency with sudden onset severe headache, left-sided weakness, and altered consciousness (GCS 10). CT brain: Right basal ganglia hemorrhage, 45ml volume, midline shift 8mm. Neurosurgeon: Emergency craniotomy for hematoma evacuation indicated. BP: 210/130 mmHg on admission. IV Labetalol and Mannitol administered. Life-threatening emergency — requesting STAT authorisation.",
                true, "Life-threatening emergency. STAT approval appropriate. Clinical documentation supports immediate surgery.", 98,
                List.of("Submit complete documentation post-procedure"),
                "APPROVED", "STAR-STAT-2024-014001",
                "STAT approval granted for emergency craniotomy. Life-threatening situation with clinical urgency confirmed.",
                "Complete documentation to be submitted within 72 hours post-procedure as per emergency authorisation policy.",
                LocalDate.of(2024,6,1), LocalDate.of(2024,6,4), 1,
                LocalDateTime.of(2024,6,1,2,15), LocalDateTime.of(2024,6,1,2,25), LocalDateTime.of(2024,6,1,2,30), LocalDate.of(2024,9,1)
        );
        hist(r14, null, AuthorizationStatus.DRAFT, "provider3", "Emergency case created");
        hist(r14, AuthorizationStatus.DRAFT, AuthorizationStatus.AI_REVIEWED, "AI_COPILOT", "AI review — STAT — confidence 98%");
        hist(r14, AuthorizationStatus.AI_REVIEWED, AuthorizationStatus.SUBMITTED, "provider3", "STAT submission");
        hist(r14, AuthorizationStatus.SUBMITTED, AuthorizationStatus.APPROVED, "payer3", "STAT approved — life-threatening emergency");

        // 15. DRAFT — recent, awaiting AI review
        AuthorizationRequest r15 = save(
                "AUTH-20240625-DR015", drPadmavathi, payerArogyasri,
                "P-HYD-015", "Durga Bhavani Polavarapu", "1995-03-17", "AROG-MBR-15102", "PLAN-TS-GOLD",
                "M75.100", "Unspecified rotator cuff tear, not specified as traumatic", "29827", "Arthroscopy, shoulder, surgical; with rotator cuff repair",
                "Outpatient Orthopaedic Surgery", "22", 1,
                LocalDate.of(2024,8,5), LocalDate.of(2024,8,5), Priority.ROUTINE, AuthorizationStatus.DRAFT,
                "Patient is a 29-year-old female with right shoulder pain and weakness for 4 months. MRI shoulder: Full thickness supraspinatus tear, 2.3cm. Requesting arthroscopic rotator cuff repair. Physiotherapy tried for 6 weeks — no improvement.",
                false, null, null, null,
                null, null, null, null, null, null, null,
                LocalDateTime.of(2024,6,25,16,0), null, null, LocalDate.of(2024,8,25)
        );
        hist(r15, null, AuthorizationStatus.DRAFT, "provider2", "Initial draft — awaiting AI review");

        // 16. SUBMITTED — maternity LSCS
        AuthorizationRequest r16 = save(
                "AUTH-20240610-SB016", drAnuradha, payerNTRVaidya,
                "P-HYD-016", "Asha Latha Kommuri", "1993-06-15", "NTR-MBR-16114", "PLAN-AP-MATERNITY",
                "O34.21", "Maternal care for scar from previous cesarean delivery", "59514", "Cesarean delivery only",
                "Inpatient Obstetrics", "21", 1,
                LocalDate.of(2024,7,5), LocalDate.of(2024,7,7), Priority.URGENT, AuthorizationStatus.SUBMITTED,
                "Patient is a 31-year-old G2P1 female at 38 weeks gestation with previous lower segment caesarean section. Current pregnancy: Cephalic presentation, placenta posterior, no placenta praevia. Previous LSCS scar on USG: Lower uterine segment thickness 2.8mm (thin scar). Obstetrician advises elective repeat LSCS due to thin uterine scar and risk of uterine rupture. Foetal well-being: NST reactive, AFI 12. No foetal distress.",
                true, "Elective repeat LSCS with documented thin uterine scar. Clinically appropriate. Ready for submission.", 88,
                List.of("Attach previous LSCS OT notes", "Include current USG report with scar thickness measurement"),
                null, null, null, null, null, null, null,
                LocalDateTime.of(2024,6,10,10,0), LocalDateTime.of(2024,6,10,10,30), LocalDateTime.of(2024,6,10,11,15), LocalDate.of(2024,8,10)
        );
        hist(r16, null, AuthorizationStatus.DRAFT, "provider4", "Created");
        hist(r16, AuthorizationStatus.DRAFT, AuthorizationStatus.AI_REVIEWED, "AI_COPILOT", "AI review — confidence 88%");
        hist(r16, AuthorizationStatus.AI_REVIEWED, AuthorizationStatus.SUBMITTED, "provider4", "Submitted to NTR Vaidya Seva");

        // 17. APPROVED — ESRD dialysis long-term
        AuthorizationRequest r17 = save(
                "AUTH-20240530-AP017", drRamaRao, payerUnited,
                "P-HYD-017", "Tirupathi Rao Ganesh", "1952-08-18", "UHI-MBR-17126", "PLAN-UHI-GOLD",
                "N18.5", "Chronic kidney disease, stage 5", "90960", "ESRD related services monthly, patients 20 years and older",
                "Inpatient Nephrology", "21", 1,
                LocalDate.of(2024,7,1), LocalDate.of(2024,12,31), Priority.URGENT, AuthorizationStatus.APPROVED,
                "Patient is a 71-year-old male with ESRD secondary to diabetic nephropathy. eGFR < 10 ml/min/1.73m2. Currently on peritoneal dialysis. Creatinine 9.8 mg/dL, Potassium 6.2 mEq/L, Bicarbonate 16 mEq/L. Requesting monthly ESRD management services and haemodialysis sessions. AV fistula created 3 months ago, maturing well.",
                true, "ESRD management with clear clinical documentation. eGFR < 10 meets threshold for ESRD services.", 97,
                List.of("Dialysis centre must be UHI empanelled"),
                "APPROVED", "UHI-AUTH-2024-017567",
                "ESRD services approved for 6 months. Review at 6-month mark.",
                "Monthly claims to be submitted with haemodialysis logs. AV fistula access required.",
                LocalDate.of(2024,7,1), LocalDate.of(2024,12,31), 1,
                LocalDateTime.of(2024,5,30,9,0), LocalDateTime.of(2024,5,30,9,30), LocalDateTime.of(2024,5,30,14,0), LocalDate.of(2025,1,31)
        );
        hist(r17, null, AuthorizationStatus.DRAFT, "provider1", "Created");
        hist(r17, AuthorizationStatus.DRAFT, AuthorizationStatus.AI_REVIEWED, "AI_COPILOT", "AI review — confidence 97%");
        hist(r17, AuthorizationStatus.AI_REVIEWED, AuthorizationStatus.SUBMITTED, "provider1", "Submitted");
        hist(r17, AuthorizationStatus.SUBMITTED, AuthorizationStatus.UNDER_REVIEW, "payer4", "Assigned to reviewer");
        hist(r17, AuthorizationStatus.UNDER_REVIEW, AuthorizationStatus.APPROVED, "payer4", "Approved — ESRD criteria met");

        // 18. PENDING_REVIEW — just submitted, cataract
        AuthorizationRequest r18 = save(
                "AUTH-20240626-PR018", drLakshmi, payerStar,
                "P-VJA-018", "Venkateswara Rao Atmakuri", "1970-04-02", "STAR-MBR-18138", "PLAN-STAR-SILVER",
                "H25.12", "Age-related nuclear cataract, left eye", "66984", "Extracapsular cataract removal with IOL",
                "Outpatient Ophthalmology", "22", 1,
                LocalDate.of(2024,7,30), LocalDate.of(2024,7,30), Priority.ROUTINE, AuthorizationStatus.PENDING_REVIEW,
                "Patient is a 54-year-old male with progressive vision loss left eye for 1 year. BCVA: Right 6/6, Left 6/36. Slit lamp: Dense nuclear cataract left eye. IOP normal bilaterally. Fundus: Normal right eye, obscured view left due to cataract. Biometry done: AL 23.1mm, IOL power +21.5D (Acrysof IQ). Requesting phacoemulsification with foldable IOL implantation left eye.",
                false, null, null, null,
                null, null, null, null, null, null, null,
                LocalDateTime.of(2024,6,26,14,30), null, null, LocalDate.of(2024,8,26)
        );
        hist(r18, null, AuthorizationStatus.DRAFT, "provider6", "Created");
        hist(r18, AuthorizationStatus.DRAFT, AuthorizationStatus.PENDING_REVIEW, "provider6", "Submitted for AI review");

        // ── Notifications ──
        notif(drRamaRao,      "Authorization Approved",           "Request AUTH-20240510-AP005 for Kondaiah Velpula (Laparoscopic Cholecystectomy) has been approved by Aarogyasri. Auth No: AROG-AUTH-2024-005892.",              "DECISION",     "AUTH-20240510-AP005", r5.getId(),  true);
        notif(drSrinivasRao,  "STAT Authorization Approved",      "Emergency request AUTH-20240601-ST014 for Kishore Kumar Alapati (Craniotomy) has been STAT approved by Star Health.",                                           "DECISION",     "AUTH-20240601-ST014", r14.getId(), true);
        notif(drLakshmi,      "Authorization Partially Approved", "Request AUTH-20240515-PA007 for Nagamani Gottipati (Psychotherapy) — 12 of 24 sessions approved by NTR Vaidya Seva.",                                          "DECISION",     "AUTH-20240515-PA007", r7.getId(),  true);
        notif(drVenkataReddy, "Authorization Denied",             "Request AUTH-20240518-DN008 for Ramakrishna Rao Nanduri (Lumbar Fusion) denied by Aarogyasri. Conservative management criteria not met.",                       "DECISION",     "AUTH-20240518-DN008", r8.getId(),  true);
        notif(drAnuradha,     "Additional Information Required",  "Star Health requires additional documentation for AUTH-20240522-PI010 (Coronary Angiography — Prasad Rao Chaganti). Please respond within 7 days.",             "INFO_REQUEST", "AUTH-20240522-PI010", r10.getId(), false);
        notif(drRamaRao,      "Additional Information Required",  "NTR Vaidya Seva requires documentation for AUTH-20240523-PI011 (Tonsillectomy — Master Arjun Yadav). Episode records and anaesthesia certificate needed.",      "INFO_REQUEST", "AUTH-20240523-PI011", r11.getId(), false);
        notif(drPadmavathi,   "AI Copilot Review Complete",       "AI review completed for AUTH-20240602-AI002 (Hemodialysis — Sujatha Rani Kotha). Confidence score: 87%. Request is ready for submission.",                      "AI_REVIEW",    "AUTH-20240602-AI002", r2.getId(),  true);
        notif(drPadmavathi,   "Authorization Denied",             "Request AUTH-20240520-DN009 for Swetha Reddy Anumula (Refractive Lens Extraction) denied by United Health — non-covered benefit under Basic Plan.",             "DECISION",     "AUTH-20240520-DN009", r9.getId(),  true);
        notif(drAnuradha,     "Request Under Payer Review",       "AUTH-20240604-UR004 (Mastectomy — Sunitha Devi Manthena) is now under clinical review by NTR Vaidya Seva.",                                                     "STATUS_CHANGE","AUTH-20240604-UR004", r4.getId(),  false);
        notif(drVenkataReddy, "Authorization Expiring Soon",      "Request AUTH-20240603-SB003 for Narasimha Rao Pelluri (PCI — Coronary Stent) will expire on 03-Aug-2024 if no decision is received. Please follow up.",         "STATUS_CHANGE","AUTH-20240603-SB003", r3.getId(),  false);

        log.info("Seeding complete — 18 authorization requests, all statuses covered, 10 notifications.");
        log.info("provider1/password | provider2/password | provider3/password | provider4/password | provider5/password | provider6/password");
        log.info("payer1/password    | payer2/password    | payer3/password    | payer4/password");
    }

    // ─── Builder Helpers ──────────────────────────────────────────────────────

    private User saveProvider(String u, String name, String email, String npi, String org) {
        return userRepo.save(User.builder().username(u).password(encoder.encode("password"))
                .fullName(name).email(email).role(UserRole.PROVIDER).organizationId(npi).organizationName(org).enabled(true).build());
    }

    private User savePayer(String u, String name, String email, String id, String org) {
        return userRepo.save(User.builder().username(u).password(encoder.encode("password"))
                .fullName(name).email(email).role(UserRole.PAYER).organizationId(id).organizationName(org).enabled(true).build());
    }

    private AuthorizationRequest save(
            String ref, User provider, User payer,
            String patId, String patName, String patDob, String memberId, String insId,
            String diagCode, String diagDesc, String procCode, String procDesc,
            String serviceType, String pos, int units,
            LocalDate startDate, LocalDate endDate,
            Priority priority, AuthorizationStatus status,
            String notes,
            boolean aiReviewed, String aiSummary, Integer aiScore, List<String> aiSuggestions,
            String payerDecision, String payerAuthNum, String payerReason, String payerNotes,
            LocalDate appStart, LocalDate appEnd, Integer appUnits,
            LocalDateTime submittedAt, LocalDateTime reviewedAt, LocalDateTime decidedAt,
            LocalDate expiresAt
    ) {
        AuthorizationRequest r = AuthorizationRequest.builder()
                .referenceNumber(ref)
                .fhirResourceId("auth-" + ref)
                .patientId(patId).patientName(patName).patientDob(patDob)
                .patientMemberId(memberId).patientInsuranceId(insId)
                .provider(provider).providerNpi(provider.getOrganizationId())
                .providerName(provider.getFullName()).facilityName(provider.getOrganizationName())
                .payer(payer).payerOrganizationId(payer.getOrganizationId()).payerName(payer.getOrganizationName())
                .diagnosisCode(diagCode).diagnosisDescription(diagDesc)
                .procedureCode(procCode).procedureDescription(procDesc)
                .serviceType(serviceType).placeOfService(pos).numberOfUnits(units)
                .requestedStartDate(startDate).requestedEndDate(endDate)
                .priority(priority).status(status).clinicalNotes(notes)
                .aiReviewed(aiReviewed).aiReviewSummary(aiSummary).aiConfidenceScore(aiScore)
                .aiSuggestions(aiSuggestions != null ? aiSuggestions : List.of())
                .payerDecision(payerDecision).payerAuthorizationNumber(payerAuthNum)
                .payerDecisionReason(payerReason).payerNotes(payerNotes)
                .approvedStartDate(appStart).approvedEndDate(appEnd).approvedUnits(appUnits)
                .submittedAt(submittedAt).reviewedAt(reviewedAt).decidedAt(decidedAt)
                .expiresAt(expiresAt).lastModifiedBy(provider.getUsername())
                .build();

        r.setCreatedAt(submittedAt != null ? submittedAt.minusHours(1) : LocalDateTime.now());
        r.setUpdatedAt(decidedAt != null ? decidedAt : submittedAt != null ? submittedAt : LocalDateTime.now());
        r.setVersionNumber(1);
        return authRepo.save(r);
    }

    private void hist(AuthorizationRequest r, AuthorizationStatus from, AuthorizationStatus to, String by, String reason) {
        statusHistoryRepo.save(StatusHistory.builder()
                .authorizationRequest(r).fromStatus(from).toStatus(to).changedBy(by).changeReason(reason).build());
    }

    private void notif(User recipient, String title, String msg, String type, String ref, Long authId, boolean read) {
        Notification n = Notification.builder()
                .recipient(recipient).title(title).message(msg)
                .type(type).referenceNumber(ref).authRequestId(authId).read(read).build();
        notificationRepo.save(n);
    }
}
