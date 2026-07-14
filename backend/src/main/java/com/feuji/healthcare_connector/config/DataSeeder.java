package com.feuji.healthcare_connector.config;

import com.feuji.healthcare_connector.entity.AuthorizationRequest;
import com.feuji.healthcare_connector.entity.User;
import com.feuji.healthcare_connector.enums.*;
import com.feuji.healthcare_connector.repository.AuthorizationRequestRepository;
import com.feuji.healthcare_connector.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import java.math.BigDecimal;
import java.time.LocalDate;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuthorizationRequestRepository requestRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() == 0) {
            seedData();
        }
    }

    private void seedData() {
        // 1. Seed Payers
        User payer = new User();
        payer.setName("Star Admin");
        payer.setEmail("payer@feuji.com");
        payer.setPassword(passwordEncoder.encode("password123"));
        payer.setRole(UserRole.PAYER);
        payer.setOrganizationName("Star Health Insurance");
        payer.setPhone("9876543211");
        payer.setEmailVerified(true);
        User savedPayer = userRepository.save(payer);

        User payer2 = new User();
        payer2.setName("Global Admin");
        payer2.setEmail("payer2@feuji.com");
        payer2.setPassword(passwordEncoder.encode("password123"));
        payer2.setRole(UserRole.PAYER);
        payer2.setOrganizationName("Global Health Alliance");
        payer2.setPhone("9876543222");
        payer2.setEmailVerified(true);
        User savedPayer2 = userRepository.save(payer2);

        // 2. Seed Providers
        User provider = new User();
        provider.setName("Dr. Avinash");
        provider.setEmail("provider@feuji.com");
        provider.setPassword(passwordEncoder.encode("password123"));
        provider.setRole(UserRole.PROVIDER);
        provider.setOrganizationName("City General Hospital");
        provider.setProviderType("General Hospital");
        provider.setPhone("9876543210");
        provider.setEmailVerified(true);
        User savedProvider = userRepository.save(provider);

        User providerAvinash = new User();
        providerAvinash.setName("Dr. Avinash (Admin)");
        providerAvinash.setEmail("this.is.avinash28@gmail.com");
        providerAvinash.setPassword(passwordEncoder.encode("password123"));
        providerAvinash.setRole(UserRole.PROVIDER);
        providerAvinash.setOrganizationName("Avinash Medical Center");
        providerAvinash.setProviderType("General Hospital");
        providerAvinash.setPhone("9876543210");
        providerAvinash.setEmailVerified(true);
        userRepository.save(providerAvinash);

        User provider2 = new User();
        provider2.setName("Dr. Smith");
        provider2.setEmail("provider2@feuji.com");
        provider2.setPassword(passwordEncoder.encode("password123"));
        provider2.setRole(UserRole.PROVIDER);
        provider2.setOrganizationName("Apex Orthopedics Clinic");
        provider2.setProviderType("Specialist Clinic");
        provider2.setPhone("9876543333");
        provider2.setEmailVerified(true);
        User savedProvider2 = userRepository.save(provider2);

        // 3. Seed Sample Requests

        // Request 1: Approved Total Knee replacement
        AuthorizationRequest req1 = new AuthorizationRequest();
        req1.setProvider(savedProvider);
        req1.setPayer(savedPayer);
        req1.setStatus(RequestStatus.APPROVED);
        req1.setPatientFirstName("Jane");
        req1.setPatientLastName("Doe");
        req1.setPatientDob(LocalDate.of(1965, 8, 12));
        req1.setPatientGender("FEMALE");
        req1.setPatientPhone("9988776655");
        req1.setPatientEmail("jane.doe@example.com");
        req1.setPatientAddress("123 Health Ave, Medical City, MC 90210");
        req1.setInsurancePolicyNumber("POL-776632");
        req1.setInsuranceGroupNumber("GRP-123");
        req1.setSubscriberName("Jane Doe");
        req1.setSubscriberRelationship(SubscriberRelationship.SELF);
        req1.setCoverageStartDate(LocalDate.of(2025, 1, 1));
        req1.setPrimaryDiagnosisCode("M17.11");
        req1.setPrimaryDiagnosisDesc("Primary osteoarthritis, right knee");
        req1.setProcedureCode("27447");
        req1.setProcedureDescription("Total knee arthroplasty");
        req1.setEstimatedCost(new BigDecimal("350000.00"));
        req1.setServiceDate(LocalDate.now().plusDays(15));
        req1.setUrgency(Urgency.ROUTINE);
        req1.setPlaceOfService(PlaceOfService.INPATIENT);
        req1.setClinicalNotes(
                "Patient suffers from severe right knee osteoarthritis. Has tried physical therapy and NSAIDs for 6 months without relief. Joint space narrowing confirmed via X-Ray. Requesting total knee replacement surgery.");
        req1.setAiQualityScore(95);
        req1.setAiValidationNotes(
                "Jane Doe presents with severe right knee osteoarthritis. Has tried physical therapy and NSAIDs for 6 months without relief. CPT 27447 is aligned with ICD-10 M17.11. Estimate is within policy bounds.");
        req1.setPayerRemarks("Approved based on clinical evidence and failed conservative therapy history.");
        requestRepository.save(req1);

        // Request 2: Rejected Obstetric diagnosis conflict
        AuthorizationRequest req2 = new AuthorizationRequest();
        req2.setProvider(savedProvider);
        req2.setPayer(savedPayer);
        req2.setStatus(RequestStatus.REJECTED);
        req2.setPatientFirstName("John");
        req2.setPatientLastName("Smith");
        req2.setPatientDob(LocalDate.of(1988, 4, 25));
        req2.setPatientGender("MALE");
        req2.setPatientPhone("9887766554");
        req2.setPatientEmail("john.smith@example.com");
        req2.setPatientAddress("456 Broad St, Metro City, MC 10001");
        req2.setInsurancePolicyNumber("POL-998811");
        req2.setSubscriberName("John Smith");
        req2.setSubscriberRelationship(SubscriberRelationship.SELF);
        req2.setCoverageStartDate(LocalDate.of(2025, 1, 1));
        req2.setPrimaryDiagnosisCode("O26.89");
        req2.setPrimaryDiagnosisDesc("Pregnancy related condition");
        req2.setProcedureCode("59400");
        req2.setProcedureDescription("Obstetrical care");
        req2.setEstimatedCost(new BigDecimal("80000.00"));
        req2.setServiceDate(LocalDate.now().plusDays(30));
        req2.setUrgency(Urgency.ROUTINE);
        req2.setPlaceOfService(PlaceOfService.OUTPATIENT);
        req2.setClinicalNotes("Obstetric examination for pregnancy care.");
        req2.setAiQualityScore(30);
        req2.setAiValidationNotes(
                "Critical conflict: Female-specific diagnosis description supplied for a male patient.");
        req2.setPayerRemarks(
                "Rejected due to fundamental data discrepancies: Gender-pregnancy mismatch on diagnosis code O26.89.");
        requestRepository.save(req2);

        // Request 3: Pending review (Submitted)
        AuthorizationRequest req3 = new AuthorizationRequest();
        req3.setProvider(savedProvider);
        req3.setPayer(savedPayer);
        req3.setStatus(RequestStatus.SUBMITTED);
        req3.setPatientFirstName("Alice");
        req3.setPatientLastName("Johnson");
        req3.setPatientDob(LocalDate.of(2010, 11, 3));
        req3.setPatientGender("FEMALE");
        req3.setPatientPhone("9776655443");
        req3.setPatientAddress("789 Pine Rd, Suburbia, SB 50321");
        req3.setInsurancePolicyNumber("POL-443322");
        req3.setSubscriberName("Robert Johnson");
        req3.setSubscriberRelationship(SubscriberRelationship.CHILD);
        req3.setCoverageStartDate(LocalDate.of(2024, 6, 1));
        req3.setPrimaryDiagnosisCode("J35.01");
        req3.setPrimaryDiagnosisDesc("Chronic tonsillitis");
        req3.setProcedureCode("42820");
        req3.setProcedureDescription("Tonsillectomy");
        req3.setEstimatedCost(new BigDecimal("45000.00"));
        req3.setServiceDate(LocalDate.now().plusDays(20));
        req3.setUrgency(Urgency.URGENT);
        req3.setPlaceOfService(PlaceOfService.OUTPATIENT);
        req3.setClinicalNotes(
                "Recurrent tonsillitis (5 episodes in last year). Patient is having difficulty swallowing and breathing during sleep. Recommended tonsillectomy.");
        req3.setAiQualityScore(88);
        req3.setAiValidationNotes(
                "Patient Alice Johnson presents with recurrent tonsillitis (5 episodes). Tonsillectomy (CPT 42820) aligns with J35.01. Highly recommended.");
        requestRepository.save(req3);

        // Request 4: Draft request
        AuthorizationRequest req4 = new AuthorizationRequest();
        req4.setProvider(savedProvider);
        req4.setPayer(savedPayer2);
        req4.setStatus(RequestStatus.DRAFT);
        req4.setPatientFirstName("Bob");
        req4.setPatientLastName("Brown");
        req4.setPatientDob(LocalDate.of(1975, 2, 17));
        req4.setPatientGender("MALE");
        req4.setPatientPhone("9665544332");
        req4.setPatientAddress("99 Oak Ln, Countryside, CS 77651");
        req4.setInsurancePolicyNumber("POL-112233");
        req4.setSubscriberName("Bob Brown");
        req4.setSubscriberRelationship(SubscriberRelationship.SELF);
        req4.setCoverageStartDate(LocalDate.of(2025, 1, 1));
        req4.setPrimaryDiagnosisCode("K59.00");
        req4.setPrimaryDiagnosisDesc("Constipation, unspecified");
        req4.setProcedureCode("45378");
        req4.setProcedureDescription("Diagnostic colonoscopy");
        req4.setEstimatedCost(new BigDecimal("60000.00"));
        req4.setServiceDate(LocalDate.now().plusDays(40));
        req4.setUrgency(Urgency.ROUTINE);
        req4.setPlaceOfService(PlaceOfService.OUTPATIENT);
        req4.setClinicalNotes(
                "Patient complains of change in bowel habits and chronic abdominal pain. Colonoscopy requested for screening.");
        requestRepository.save(req4);

        // Request 5: Info Requested - MRI Spine
        AuthorizationRequest req5 = new AuthorizationRequest();
        req5.setProvider(savedProvider2);
        req5.setPayer(savedPayer);
        req5.setStatus(RequestStatus.INFO_REQUESTED);
        req5.setPatientFirstName("Michael");
        req5.setPatientLastName("Scott");
        req5.setPatientDob(LocalDate.of(1964, 3, 15));
        req5.setPatientGender("MALE");
        req5.setPatientPhone("9112233445");
        req5.setPatientAddress("Scranton, PA");
        req5.setInsurancePolicyNumber("POL-332211");
        req5.setSubscriberName("Michael Scott");
        req5.setSubscriberRelationship(SubscriberRelationship.SELF);
        req5.setCoverageStartDate(LocalDate.of(2020, 1, 1));
        req5.setPrimaryDiagnosisCode("M54.5");
        req5.setPrimaryDiagnosisDesc("Low back pain");
        req5.setProcedureCode("72148");
        req5.setProcedureDescription("MRI Lumbar Spine");
        req5.setEstimatedCost(new BigDecimal("12000.00"));
        req5.setServiceDate(LocalDate.now().plusDays(5));
        req5.setUrgency(Urgency.ROUTINE);
        req5.setPlaceOfService(PlaceOfService.OUTPATIENT);
        req5.setClinicalNotes("Patient complains of chronic low back pain. Radiating to left leg.");
        req5.setPayerRemarks(
                "Please provide records of at least 6 weeks of conservative treatment (PT) prior to approving MRI.");
        requestRepository.save(req5);

        // Request 6: Submitted - Cardiac Catheterization
        AuthorizationRequest req6 = new AuthorizationRequest();
        req6.setProvider(savedProvider);
        req6.setPayer(savedPayer);
        req6.setStatus(RequestStatus.SUBMITTED);
        req6.setPatientFirstName("Sarah");
        req6.setPatientLastName("Connor");
        req6.setPatientDob(LocalDate.of(1959, 11, 29));
        req6.setPatientGender("FEMALE");
        req6.setPatientPhone("9881122334");
        req6.setPatientAddress("Los Angeles, CA");
        req6.setInsurancePolicyNumber("POL-999888");
        req6.setSubscriberName("Sarah Connor");
        req6.setSubscriberRelationship(SubscriberRelationship.SELF);
        req6.setCoverageStartDate(LocalDate.of(2023, 1, 1));
        req6.setPrimaryDiagnosisCode("I20.9");
        req6.setPrimaryDiagnosisDesc("Angina pectoris, unspecified");
        req6.setProcedureCode("93458");
        req6.setProcedureDescription("Cardiac catheterization");
        req6.setEstimatedCost(new BigDecimal("210000.00"));
        req6.setServiceDate(LocalDate.now().plusDays(2));
        req6.setUrgency(Urgency.URGENT);
        req6.setPlaceOfService(PlaceOfService.INPATIENT);
        req6.setClinicalNotes(
                "Patient presented to ED with chest pain. Abnormal stress test. Requesting cardiac cath.");
        requestRepository.save(req6);

        // Request 7: Under Review - Sleep Study
        AuthorizationRequest req7 = new AuthorizationRequest();
        req7.setProvider(savedProvider2);
        req7.setPayer(savedPayer2);
        req7.setStatus(RequestStatus.UNDER_REVIEW);
        req7.setPatientFirstName("Dwight");
        req7.setPatientLastName("Schrute");
        req7.setPatientDob(LocalDate.of(1970, 1, 20));
        req7.setPatientGender("MALE");
        req7.setPatientPhone("9001100110");
        req7.setPatientAddress("Schrute Farms, PA");
        req7.setInsurancePolicyNumber("POL-777666");
        req7.setSubscriberName("Dwight Schrute");
        req7.setSubscriberRelationship(SubscriberRelationship.SELF);
        req7.setCoverageStartDate(LocalDate.of(2021, 1, 1));
        req7.setPrimaryDiagnosisCode("G47.33");
        req7.setPrimaryDiagnosisDesc("Obstructive sleep apnea (adult)");
        req7.setProcedureCode("95810");
        req7.setProcedureDescription("Polysomnography");
        req7.setEstimatedCost(new BigDecimal("45000.00"));
        req7.setServiceDate(LocalDate.now().plusDays(10));
        req7.setUrgency(Urgency.ROUTINE);
        req7.setPlaceOfService(PlaceOfService.OUTPATIENT);
        req7.setClinicalNotes("Excessive daytime sleepiness. Snoring observed by partner. BMI > 30.");
        requestRepository.save(req7);
    }
}
