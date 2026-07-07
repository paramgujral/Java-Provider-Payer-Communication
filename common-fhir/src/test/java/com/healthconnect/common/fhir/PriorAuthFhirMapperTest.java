package com.healthconnect.common.fhir;

import com.healthconnect.common.model.AuthorizationStatus;
import com.healthconnect.common.model.DecisionData;
import com.healthconnect.common.model.PriorAuthData;
import com.healthconnect.common.model.Urgency;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;

class PriorAuthFhirMapperTest {

    private final PriorAuthFhirMapper mapper = new PriorAuthFhirMapper();

    private PriorAuthData sampleRequest() {
        PriorAuthData data = new PriorAuthData();
        data.setRequestNumber("PA-2026-0042");
        data.setPatientFirstName("Jane");
        data.setPatientLastName("Doe");
        data.setPatientDob(LocalDate.of(1985, 3, 14));
        data.setPatientGender("female");
        data.setMemberId("MBR12345678");
        data.setPayerName("Acme Health Insurance");
        data.setInsurancePlan("Gold PPO");
        data.setProviderName("City General Hospital");
        data.setProviderNpi("1234567893");
        data.setDiagnosisCode("M17.11");
        data.setDiagnosisDescription("Unilateral primary osteoarthritis, right knee");
        data.setProcedureCode("27447");
        data.setProcedureDescription("Total knee arthroplasty");
        data.setServiceDate(LocalDate.of(2026, 8, 15));
        data.setUrgency(Urgency.URGENT);
        data.setClinicalJustification("Failed 6 months of conservative therapy; severe functional limitation.");
        data.setRequestedAmount(new BigDecimal("32500.00"));
        return data;
    }

    @Test
    void requestSurvivesFhirRoundTrip() {
        PriorAuthData original = sampleRequest();

        String bundleJson = mapper.toRequestBundleJson(original);
        assertThat(bundleJson).contains("\"resourceType\": \"Bundle\"");
        assertThat(bundleJson).contains("preauthorization");

        PriorAuthData parsed = mapper.fromRequestBundleJson(bundleJson);

        assertThat(parsed.getRequestNumber()).isEqualTo(original.getRequestNumber());
        assertThat(parsed.getPatientFirstName()).isEqualTo(original.getPatientFirstName());
        assertThat(parsed.getPatientLastName()).isEqualTo(original.getPatientLastName());
        assertThat(parsed.getPatientDob()).isEqualTo(original.getPatientDob());
        assertThat(parsed.getPatientGender()).isEqualTo(original.getPatientGender());
        assertThat(parsed.getMemberId()).isEqualTo(original.getMemberId());
        assertThat(parsed.getPayerName()).isEqualTo(original.getPayerName());
        assertThat(parsed.getInsurancePlan()).isEqualTo(original.getInsurancePlan());
        assertThat(parsed.getProviderName()).isEqualTo(original.getProviderName());
        assertThat(parsed.getProviderNpi()).isEqualTo(original.getProviderNpi());
        assertThat(parsed.getDiagnosisCode()).isEqualTo(original.getDiagnosisCode());
        assertThat(parsed.getProcedureCode()).isEqualTo(original.getProcedureCode());
        assertThat(parsed.getServiceDate()).isEqualTo(original.getServiceDate());
        assertThat(parsed.getUrgency()).isEqualTo(original.getUrgency());
        assertThat(parsed.getClinicalJustification()).isEqualTo(original.getClinicalJustification());
        assertThat(parsed.getRequestedAmount()).isEqualByComparingTo(original.getRequestedAmount());
    }

    @Test
    void decisionSurvivesFhirRoundTrip() {
        DecisionData decision = new DecisionData(
                "PA-2026-0042", "CASE-00017", AuthorizationStatus.INFO_REQUESTED,
                "Please attach recent imaging results.");

        String json = mapper.toClaimResponseJson(decision, sampleRequest());
        assertThat(json).contains("\"resourceType\": \"ClaimResponse\"");

        DecisionData parsed = mapper.fromClaimResponseJson(json);
        assertThat(parsed.getRequestNumber()).isEqualTo("PA-2026-0042");
        assertThat(parsed.getCaseNumber()).isEqualTo("CASE-00017");
        assertThat(parsed.getStatus()).isEqualTo(AuthorizationStatus.INFO_REQUESTED);
        assertThat(parsed.getNote()).isEqualTo("Please attach recent imaging results.");
    }

    @Test
    void approvalAndRejectionMapToFhirOutcomes() {
        DecisionData approve = new DecisionData("PA-1", "C-1", AuthorizationStatus.APPROVED, "ok");
        assertThat(mapper.fromClaimResponseJson(mapper.toClaimResponseJson(approve, null)).getStatus())
                .isEqualTo(AuthorizationStatus.APPROVED);

        DecisionData reject = new DecisionData("PA-2", "C-2", AuthorizationStatus.REJECTED, "no");
        assertThat(mapper.fromClaimResponseJson(mapper.toClaimResponseJson(reject, null)).getStatus())
                .isEqualTo(AuthorizationStatus.REJECTED);
    }
}
