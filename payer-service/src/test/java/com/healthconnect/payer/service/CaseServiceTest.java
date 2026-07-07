package com.healthconnect.payer.service;

import com.healthconnect.common.fhir.PriorAuthFhirMapper;
import com.healthconnect.common.model.AuthorizationStatus;
import com.healthconnect.common.model.DecisionData;
import com.healthconnect.common.model.PriorAuthData;
import com.healthconnect.common.model.Urgency;
import com.healthconnect.payer.domain.PriorAuthCase;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/** Payer workflow tests using the FHIR wire format. */
@SpringBootTest
class CaseServiceTest {

    @Autowired
    private CaseService caseService;

    @Autowired
    private PriorAuthFhirMapper fhirMapper;

    @MockitoBean
    private ProviderClient providerClient;

    private PriorAuthData sampleRequest(String requestNumber) {
        PriorAuthData data = new PriorAuthData();
        data.setRequestNumber(requestNumber);
        data.setPatientFirstName("Jane");
        data.setPatientLastName("Doe");
        data.setPatientDob(LocalDate.of(1968, 3, 14));
        data.setPatientGender("female");
        data.setMemberId("MBR12345678");
        data.setPayerName("Acme Health Insurance");
        data.setInsurancePlan("Gold PPO");
        data.setProviderName("City General Hospital");
        data.setProviderNpi("1234567893");
        data.setDiagnosisCode("M17.11");
        data.setDiagnosisDescription("Knee osteoarthritis");
        data.setProcedureCode("27447");
        data.setProcedureDescription("Total knee arthroplasty");
        data.setServiceDate(LocalDate.now().plusWeeks(6));
        data.setUrgency(Urgency.URGENT);
        data.setClinicalJustification("Failed conservative therapy.");
        data.setRequestedAmount(new BigDecimal("62500.00"));
        return data;
    }

    @Test
    void intakeOpensCaseAndAcknowledgesWithQueuedClaimResponse() {
        String ackJson = caseService.intake(fhirMapper.toRequestBundleJson(sampleRequest("PA-TEST-001")));

        DecisionData ack = fhirMapper.fromClaimResponseJson(ackJson);
        assertThat(ack.getRequestNumber()).isEqualTo("PA-TEST-001");
        assertThat(ack.getCaseNumber()).startsWith("CASE-");
        assertThat(ack.getStatus()).isEqualTo(AuthorizationStatus.PENDING_REVIEW);

        PriorAuthCase created = caseService.list(AuthorizationStatus.PENDING_REVIEW).stream()
                .filter(c -> c.getRequestNumber().equals("PA-TEST-001"))
                .findFirst().orElseThrow();
        assertThat(created.getPatientLastName()).isEqualTo("Doe");
        assertThat(created.getReviewFlags()).contains("EXPEDITE").contains("HIGH_AMOUNT");
        assertThat(created.getRawBundleJson()).contains("preauthorization");
    }

    @Test
    void approvalNotifiesProviderWithFhirClaimResponse() {
        when(providerClient.sendDecision(anyString())).thenReturn(true);
        caseService.intake(fhirMapper.toRequestBundleJson(sampleRequest("PA-TEST-002")));
        Long caseId = findCase("PA-TEST-002").getId();

        PriorAuthCase decided = caseService.decide(caseId, CaseService.ReviewAction.APPROVE, "Medically necessary");

        assertThat(decided.getStatus()).isEqualTo(AuthorizationStatus.APPROVED);
        verify(providerClient).sendDecision(anyString());
        // A decided case cannot be decided again
        assertThatThrownBy(() -> caseService.decide(caseId, CaseService.ReviewAction.REJECT, "no"))
                .isInstanceOf(CaseService.InvalidStateException.class);
    }

    @Test
    void infoRequestThenResubmissionReentersReviewQueue() {
        when(providerClient.sendDecision(anyString())).thenReturn(true);
        String bundleJson = fhirMapper.toRequestBundleJson(sampleRequest("PA-TEST-003"));
        caseService.intake(bundleJson);
        Long caseId = findCase("PA-TEST-003").getId();

        caseService.decide(caseId, CaseService.ReviewAction.REQUEST_INFO, "Please attach imaging results");
        assertThat(findCase("PA-TEST-003").getStatus()).isEqualTo(AuthorizationStatus.INFO_REQUESTED);

        // Provider resubmits the same request number -> same case, back in review
        caseService.intake(bundleJson);
        PriorAuthCase resubmitted = findCase("PA-TEST-003");
        assertThat(resubmitted.getStatus()).isEqualTo(AuthorizationStatus.PENDING_REVIEW);
        assertThat(resubmitted.getResubmissionCount()).isEqualTo(1);
        assertThat(resubmitted.getReviewFlags()).contains("RESUBMISSION");
    }

    @Test
    void rejectionRequiresANote() {
        caseService.intake(fhirMapper.toRequestBundleJson(sampleRequest("PA-TEST-004")));
        Long caseId = findCase("PA-TEST-004").getId();

        assertThatThrownBy(() -> caseService.decide(caseId, CaseService.ReviewAction.REJECT, " "))
                .isInstanceOf(CaseService.InvalidStateException.class)
                .hasMessageContaining("note");
    }

    private PriorAuthCase findCase(String requestNumber) {
        return caseService.list(null).stream()
                .filter(c -> c.getRequestNumber().equals(requestNumber))
                .findFirst().orElseThrow();
    }
}
