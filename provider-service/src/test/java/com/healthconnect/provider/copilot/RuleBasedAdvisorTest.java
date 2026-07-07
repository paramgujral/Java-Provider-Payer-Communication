package com.healthconnect.provider.copilot;

import com.healthconnect.common.model.Urgency;
import com.healthconnect.provider.domain.AuthorizationRequest;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class RuleBasedAdvisorTest {

    private final RuleBasedAdvisor advisor = new RuleBasedAdvisor();

    private AuthorizationRequest completeRequest() {
        AuthorizationRequest r = new AuthorizationRequest();
        r.setPatientFirstName("Jane");
        r.setPatientLastName("Doe");
        r.setPatientDob(LocalDate.of(1968, 3, 14));
        r.setPatientGender("female");
        r.setMemberId("MBR12345678");
        r.setPayerName("Acme Health Insurance");
        r.setInsurancePlan("Gold PPO");
        r.setProviderName("City General Hospital");
        r.setProviderNpi("1234567893"); // valid Luhn checksum
        r.setDiagnosisCode("M17.11");
        r.setDiagnosisDescription("Unilateral primary osteoarthritis, right knee");
        r.setProcedureCode("27447");
        r.setProcedureDescription("Total knee arthroplasty");
        r.setServiceDate(LocalDate.now().plusWeeks(6));
        r.setUrgency(Urgency.ROUTINE);
        r.setClinicalJustification("Failed 6 months of conservative therapy including PT and injections; "
                + "severe functional limitation documented.");
        r.setRequestedAmount(new BigDecimal("32500.00"));
        return r;
    }

    private boolean hasFinding(List<CopilotFinding> findings, String field, CopilotFinding.Severity severity) {
        return findings.stream().anyMatch(f -> f.field().equals(field) && f.severity() == severity);
    }

    @Test
    void cleanRequestProducesNoFindings() {
        assertThat(advisor.review(completeRequest())).isEmpty();
    }

    @Test
    void missingCriticalFieldsAreErrors() {
        AuthorizationRequest r = completeRequest();
        r.setPatientLastName(null);
        r.setMemberId("");
        r.setDiagnosisCode(null);

        List<CopilotFinding> findings = advisor.review(r);

        assertThat(hasFinding(findings, "patientLastName", CopilotFinding.Severity.ERROR)).isTrue();
        assertThat(hasFinding(findings, "memberId", CopilotFinding.Severity.ERROR)).isTrue();
        assertThat(hasFinding(findings, "diagnosisCode", CopilotFinding.Severity.ERROR)).isTrue();
    }

    @Test
    void invalidCodesAreErrors() {
        AuthorizationRequest r = completeRequest();
        r.setDiagnosisCode("17.11");    // must start with a letter
        r.setProcedureCode("274");      // must be 5 digits

        List<CopilotFinding> findings = advisor.review(r);

        assertThat(hasFinding(findings, "diagnosisCode", CopilotFinding.Severity.ERROR)).isTrue();
        assertThat(hasFinding(findings, "procedureCode", CopilotFinding.Severity.ERROR)).isTrue();
    }

    @Test
    void npiChecksumIsValidated() {
        assertThat(RuleBasedAdvisor.hasValidNpiChecksum("1234567893")).isTrue();
        assertThat(RuleBasedAdvisor.hasValidNpiChecksum("1234567890")).isFalse();

        AuthorizationRequest r = completeRequest();
        r.setProviderNpi("1234567890");
        assertThat(hasFinding(advisor.review(r), "providerNpi", CopilotFinding.Severity.ERROR)).isTrue();
    }

    @Test
    void diagnosisProcedureMismatchIsWarned() {
        AuthorizationRequest r = completeRequest();
        r.setDiagnosisCode("K21.9"); // reflux disease does not justify a knee replacement

        assertThat(hasFinding(advisor.review(r), "diagnosisCode", CopilotFinding.Severity.WARNING)).isTrue();
    }

    @Test
    void pastServiceDateAndHighAmountAreWarnings() {
        AuthorizationRequest r = completeRequest();
        r.setServiceDate(LocalDate.now().minusDays(5));
        r.setRequestedAmount(new BigDecimal("185000"));

        List<CopilotFinding> findings = advisor.review(r);

        assertThat(hasFinding(findings, "serviceDate", CopilotFinding.Severity.WARNING)).isTrue();
        assertThat(hasFinding(findings, "requestedAmount", CopilotFinding.Severity.WARNING)).isTrue();
    }

    @Test
    void missingJustificationIsWarned() {
        AuthorizationRequest r = completeRequest();
        r.setClinicalJustification("  ");

        assertThat(hasFinding(advisor.review(r), "clinicalJustification", CopilotFinding.Severity.WARNING)).isTrue();
    }
}
