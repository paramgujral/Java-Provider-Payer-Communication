package com.healthconnect.provider.copilot;

import com.healthconnect.common.model.Urgency;
import com.healthconnect.provider.domain.AuthorizationRequest;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.Period;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.regex.Pattern;

/** Rule-based validation checks for common submission problems. */
@Component
public class RuleBasedAdvisor implements CopilotAdvisor {

    static final String SOURCE = "rules";

    private static final Pattern ICD10 = Pattern.compile("^[A-TV-Z][0-9][0-9A-Z](\\.[0-9A-Z]{1,4})?$");
    private static final Pattern CPT = Pattern.compile("^\\d{5}$|^[A-Z]\\d{4}$");
    private static final Pattern MEMBER_ID = Pattern.compile("^[A-Za-z0-9-]{6,15}$");
    private static final BigDecimal HIGH_AMOUNT = new BigDecimal("100000");

    // CPT procedure -> ICD-10 prefixes that commonly justify it
    private static final Map<String, Set<String>> PROCEDURE_DIAGNOSIS_MAP = Map.of(
            "27447", Set.of("M17"),                          // total knee arthroplasty -> knee osteoarthritis
            "27130", Set.of("M16"),                          // total hip arthroplasty -> hip osteoarthritis
            "70551", Set.of("G43", "G40", "R51", "S06"),     // MRI brain -> migraine/epilepsy/headache/head injury
            "72148", Set.of("M51", "M54"),                   // MRI lumbar spine -> disc disorders/back pain
            "29881", Set.of("M23", "S83"),                   // knee arthroscopy -> meniscus derangement/tear
            "43239", Set.of("K21", "K25", "K29", "R13"),     // upper GI endoscopy -> reflux/ulcer/gastritis/dysphagia
            "93458", Set.of("I20", "I21", "I25"),            // cardiac catheterization -> ischemic heart disease
            "66984", Set.of("H25", "H26"));                  // cataract surgery -> cataract

    @Override
    public String name() {
        return SOURCE;
    }

    @Override
    public List<CopilotFinding> review(AuthorizationRequest r) {
        List<CopilotFinding> findings = new ArrayList<>();

        checkRequiredFields(r, findings);
        checkPatient(r, findings);
        checkIdentifiers(r, findings);
        checkClinicalCodes(r, findings);
        checkDates(r, findings);
        checkFinancials(r, findings);
        checkJustification(r, findings);

        return findings;
    }

    private void checkRequiredFields(AuthorizationRequest r, List<CopilotFinding> f) {
        requireText(f, "patientFirstName", r.getPatientFirstName(), "Patient first name");
        requireText(f, "patientLastName", r.getPatientLastName(), "Patient last name");
        requireText(f, "memberId", r.getMemberId(), "Insurance member ID");
        requireText(f, "providerName", r.getProviderName(), "Provider name");
        requireText(f, "providerNpi", r.getProviderNpi(), "Provider NPI");
        requireText(f, "diagnosisCode", r.getDiagnosisCode(), "Diagnosis code (ICD-10)");
        requireText(f, "procedureCode", r.getProcedureCode(), "Procedure code (CPT)");
        if (r.getPatientDob() == null) {
            f.add(CopilotFinding.error("patientDob", "Patient date of birth is missing.",
                    "Enter the patient's date of birth — payers reject requests without it.", SOURCE));
        }
        if (r.getServiceDate() == null) {
            f.add(CopilotFinding.error("serviceDate", "Planned service date is missing.",
                    "Enter the planned date of service.", SOURCE));
        }
        if (r.getRequestedAmount() == null) {
            f.add(CopilotFinding.error("requestedAmount", "Requested amount is missing.",
                    "Enter the estimated cost being requested for authorization.", SOURCE));
        }
        if (isBlank(r.getPatientGender())) {
            f.add(CopilotFinding.warning("patientGender", "Patient gender is not specified.",
                    "Select the patient's gender as recorded with the payer.", SOURCE));
        }
    }

    private void requireText(List<CopilotFinding> f, String field, String value, String label) {
        if (isBlank(value)) {
            f.add(CopilotFinding.error(field, label + " is missing.",
                    "Fill in " + label.toLowerCase() + " — this is critical information the payer requires.", SOURCE));
        }
    }

    private void checkPatient(AuthorizationRequest r, List<CopilotFinding> f) {
        LocalDate dob = r.getPatientDob();
        if (dob == null) {
            return;
        }
        if (dob.isAfter(LocalDate.now())) {
            f.add(CopilotFinding.error("patientDob", "Patient date of birth is in the future.",
                    "Correct the date of birth — it must be in the past.", SOURCE));
        } else if (Period.between(dob, LocalDate.now()).getYears() > 120) {
            f.add(CopilotFinding.warning("patientDob", "Patient age exceeds 120 years.",
                    "Double-check the date of birth for a typo in the year.", SOURCE));
        }
    }

    private void checkIdentifiers(AuthorizationRequest r, List<CopilotFinding> f) {
        String npi = r.getProviderNpi();
        if (!isBlank(npi)) {
            if (!npi.matches("\\d{10}")) {
                f.add(CopilotFinding.error("providerNpi", "NPI must be exactly 10 digits.",
                        "Enter the provider's 10-digit National Provider Identifier.", SOURCE));
            } else if (!hasValidNpiChecksum(npi)) {
                f.add(CopilotFinding.error("providerNpi", "NPI fails its checksum — likely a typo.",
                        "Verify the NPI digits; NPIs carry a Luhn check digit and this one does not validate.", SOURCE));
            }
        }
        String memberId = r.getMemberId();
        if (!isBlank(memberId) && !MEMBER_ID.matcher(memberId).matches()) {
            f.add(CopilotFinding.warning("memberId", "Member ID format looks unusual.",
                    "Member IDs are typically 6-15 letters, digits or dashes — confirm against the insurance card.", SOURCE));
        }
    }

    // Luhn check over "80840" + first 9 digits; result must equal the 10th digit
    static boolean hasValidNpiChecksum(String npi) {
        String base = "80840" + npi.substring(0, 9);
        int sum = 0;
        boolean doubleIt = true;
        for (int i = base.length() - 1; i >= 0; i--) {
            int d = base.charAt(i) - '0';
            if (doubleIt) {
                d *= 2;
                if (d > 9) {
                    d -= 9;
                }
            }
            sum += d;
            doubleIt = !doubleIt;
        }
        int checkDigit = (10 - (sum % 10)) % 10;
        return checkDigit == npi.charAt(9) - '0';
    }

    private void checkClinicalCodes(AuthorizationRequest r, List<CopilotFinding> f) {
        String dx = r.getDiagnosisCode();
        if (!isBlank(dx) && !ICD10.matcher(dx.trim().toUpperCase()).matches()) {
            f.add(CopilotFinding.error("diagnosisCode", "'" + dx + "' is not a valid ICD-10 code format.",
                    "Use an ICD-10-CM code such as M17.11 (letter + digits, optional decimal part).", SOURCE));
        }
        String cpt = r.getProcedureCode();
        if (!isBlank(cpt) && !CPT.matcher(cpt.trim().toUpperCase()).matches()) {
            f.add(CopilotFinding.error("procedureCode", "'" + cpt + "' is not a valid CPT/HCPCS code format.",
                    "Use a 5-digit CPT code (e.g. 27447) or a HCPCS code (letter + 4 digits).", SOURCE));
        }
        if (!isBlank(dx) && !isBlank(cpt)) {
            Set<String> expectedPrefixes = PROCEDURE_DIAGNOSIS_MAP.get(cpt.trim());
            if (expectedPrefixes != null
                    && expectedPrefixes.stream().noneMatch(p -> dx.trim().toUpperCase().startsWith(p))) {
                f.add(CopilotFinding.warning("diagnosisCode",
                        "Diagnosis " + dx + " does not typically support procedure " + cpt + ".",
                        "Payers frequently deny this combination as not medically necessary. Verify the codes, "
                                + "or strengthen the clinical justification explaining the medical necessity.", SOURCE));
            }
        }
    }

    private void checkDates(AuthorizationRequest r, List<CopilotFinding> f) {
        LocalDate serviceDate = r.getServiceDate();
        if (serviceDate == null) {
            return;
        }
        if (serviceDate.isBefore(LocalDate.now())) {
            f.add(CopilotFinding.warning("serviceDate", "Service date is in the past.",
                    "Prior authorization is normally obtained before the service; past dates usually require a "
                            + "retro-authorization process instead.", SOURCE));
        } else if (serviceDate.isAfter(LocalDate.now().plusYears(1))) {
            f.add(CopilotFinding.warning("serviceDate", "Service date is more than a year away.",
                    "Most authorizations are only valid for 60-90 days — submit closer to the service date.", SOURCE));
        }
        if (r.getUrgency() == Urgency.EMERGENCY && serviceDate.isAfter(LocalDate.now().plusDays(14))) {
            f.add(CopilotFinding.warning("urgency", "Urgency is EMERGENCY but the service is more than two weeks out.",
                    "Emergency requests are expedited by payers; use ROUTINE unless the timeline genuinely requires it.",
                    SOURCE));
        }
    }

    private void checkFinancials(AuthorizationRequest r, List<CopilotFinding> f) {
        BigDecimal amount = r.getRequestedAmount();
        if (amount == null) {
            return;
        }
        if (amount.signum() <= 0) {
            f.add(CopilotFinding.error("requestedAmount", "Requested amount must be greater than zero.",
                    "Enter the estimated cost of the requested service.", SOURCE));
        } else if (amount.compareTo(HIGH_AMOUNT) > 0) {
            f.add(CopilotFinding.warning("requestedAmount", "Requested amount exceeds $100,000.",
                    "High-cost requests get extra scrutiny — attach itemized cost estimates and supporting "
                            + "clinical documentation.", SOURCE));
        }
    }

    private void checkJustification(AuthorizationRequest r, List<CopilotFinding> f) {
        String justification = r.getClinicalJustification();
        if (isBlank(justification)) {
            f.add(CopilotFinding.warning("clinicalJustification", "No clinical justification provided.",
                    "Add a medical-necessity narrative (symptoms, duration, failed conservative treatment). "
                            + "Requests without one are the top cause of information requests from payers.", SOURCE));
        } else if (justification.trim().length() < 40) {
            f.add(CopilotFinding.info("clinicalJustification", "Clinical justification is very brief.",
                    "Expand the narrative: prior treatments tried, duration of symptoms, and functional impact "
                            + "measurably reduce denial rates.", SOURCE));
        }
    }

    private boolean isBlank(String s) {
        return s == null || s.isBlank();
    }
}
