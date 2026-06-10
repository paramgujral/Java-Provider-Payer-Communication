package ai.authbridge.copilot;

import ai.authbridge.copilot.CopilotReview.Issue;
import ai.authbridge.domain.AuthorizationRequest;
import ai.authbridge.domain.Enums.Priority;
import ai.authbridge.domain.Enums.Severity;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;
import org.springframework.stereotype.Service;

/**
 * AI Copilot review engine.
 *
 * <p>Ships with a deterministic rules engine (zero external dependencies) so the platform is fully
 * functional offline. To upgrade to an LLM-backed reviewer, add an {@code LlmCopilotService}
 * implementing the same contract and select it via configuration / the {@code ANTHROPIC_API_KEY}.
 * The rules output doubles as a high-quality fallback and few-shot example for the LLM prompt.
 */
@Service
public class CopilotService {

    private static final Pattern CPT = Pattern.compile("^\\d{5}$");
    private static final Pattern ICD10 = Pattern.compile("^[A-TV-Z][0-9][0-9AB](\\.[0-9A-Z]{1,4})?$", Pattern.CASE_INSENSITIVE);
    private static final Pattern CONSERVATIVE =
            Pattern.compile("(physical therapy|conservative|nsaid|medication|tried|failed)", Pattern.CASE_INSENSITIVE);

    public CopilotReview review(AuthorizationRequest r) {
        List<Issue> issues = new ArrayList<>();

        if (isBlank(r.getServiceRequested())) {
            issues.add(new Issue(Severity.ERROR, "serviceRequested", "Requested service is missing",
                    "Payers cannot adjudicate without a clearly named procedure or service.",
                    "Name the specific procedure, e.g. 'MRI lumbar spine without contrast'."));
        }

        if (r.getCptCodes() == null || r.getCptCodes().isEmpty()) {
            issues.add(new Issue(Severity.ERROR, "cptCodes", "No CPT/HCPCS code provided",
                    "At least one procedure code is required for medical-necessity review.",
                    "Add the CPT code that matches the requested service."));
        } else {
            var bad = r.getCptCodes().stream().filter(c -> !CPT.matcher(c.trim()).matches()).toList();
            if (!bad.isEmpty()) {
                issues.add(new Issue(Severity.WARNING, "cptCodes", "Malformed CPT code(s): " + String.join(", ", bad),
                        "CPT codes are 5 numeric digits. Malformed codes are a top cause of auto-rejection.",
                        "Re-check the codes against the current CPT code set."));
            }
        }

        if (r.getIcd10Codes() == null || r.getIcd10Codes().isEmpty()) {
            issues.add(new Issue(Severity.ERROR, "icd10Codes", "No ICD-10 diagnosis code provided",
                    "A supporting diagnosis is required to establish medical necessity.",
                    "Add the ICD-10 code describing the condition that justifies the service."));
        } else {
            var bad = r.getIcd10Codes().stream().filter(c -> !ICD10.matcher(c.trim()).matches()).toList();
            if (!bad.isEmpty()) {
                issues.add(new Issue(Severity.WARNING, "icd10Codes", "ICD-10 code format looks off: " + String.join(", ", bad),
                        "ICD-10-CM codes start with a letter followed by digits (e.g. M54.16).",
                        "Verify the diagnosis code format."));
            }
        }

        String justification = r.getClinicalJustification() == null ? "" : r.getClinicalJustification().trim();
        boolean conservative = CONSERVATIVE.matcher(justification).find();
        if (justification.isEmpty()) {
            issues.add(new Issue(Severity.ERROR, "clinicalJustification", "Clinical justification is empty",
                    "A medical-necessity narrative is the single biggest driver of approval.",
                    "Describe symptoms, duration, failed conservative treatment, and expected benefit."));
        } else if (justification.length() < 120) {
            issues.add(new Issue(Severity.WARNING, "clinicalJustification", "Justification is thin",
                    "Short narratives are frequently returned with a request for additional information.",
                    "Include conservative therapies already tried and their outcomes."));
        }
        if (!justification.isEmpty() && !conservative) {
            issues.add(new Issue(Severity.INFO, "clinicalJustification", "No mention of conservative treatment",
                    "Most payer policies require documentation that conservative care was attempted first.",
                    "State which conservative treatments were tried and over what period."));
        }

        if (r.getDocuments() == null || r.getDocuments().isEmpty()) {
            issues.add(new Issue(Severity.WARNING, "documents", "No supporting documents attached",
                    "Clinical notes or imaging reports substantially increase first-pass approval.",
                    "Attach the relevant clinical notes, labs, or imaging."));
        }

        if (r.getRequestedUnits() <= 0) {
            issues.add(new Issue(Severity.WARNING, "requestedUnits", "Requested units not specified",
                    "Unit count is required for visit- or session-based services.",
                    "Set the number of units/visits being requested."));
        }

        long errors = issues.stream().filter(i -> i.severity() == Severity.ERROR).count();
        long warnings = issues.stream().filter(i -> i.severity() == Severity.WARNING).count();
        long infos = issues.stream().filter(i -> i.severity() == Severity.INFO).count();

        int completeness = clamp((int) (100 - errors * 22 - warnings * 9 - infos * 3));
        int approval = completeness + (conservative ? 6 : 0)
                + (r.getDocuments() != null && r.getDocuments().size() >= 2 ? 6 : 0)
                + (r.getPriority() == Priority.STAT ? -4 : 0);
        approval = clamp((int) (approval - errors * 8));

        String summary = buildSummary(r, approval, errors, warnings);
        String narrative = justification.isEmpty() ? buildNarrative(r) : null;

        return new CopilotReview(completeness, approval, issues, summary, narrative, "rules", Instant.now());
    }

    private String buildSummary(AuthorizationRequest r, int approval, long errors, long warnings) {
        String svc = isBlank(r.getServiceRequested()) ? "the requested service" : r.getServiceRequested().trim();
        if (errors > 0)
            return "This request for " + svc + " is not ready to submit. " + errors + " blocking issue(s) must be resolved first. "
                    + "Estimated approval likelihood is " + approval + "% as written.";
        if (warnings > 0)
            return "This request for " + svc + " is submittable but can be strengthened. Addressing the " + warnings
                    + " flagged item(s) would raise the approval likelihood above the current " + approval + "%.";
        return "This request for " + svc + " looks complete and well-documented. Estimated approval likelihood is " + approval + "%.";
    }

    private String buildNarrative(AuthorizationRequest r) {
        String svc = isBlank(r.getServiceRequested()) ? "[service]" : r.getServiceRequested().trim();
        String dx = r.getIcd10Codes() != null && !r.getIcd10Codes().isEmpty() ? r.getIcd10Codes().get(0) : "[diagnosis]";
        return "Patient presents with " + dx + ". Conservative management (e.g. NSAIDs and physical therapy) has been "
                + "attempted for [duration] without adequate improvement. " + svc + " is requested to [clarify diagnosis / "
                + "guide treatment]. Expected clinical benefit: [describe]. Supporting documentation attached.";
    }

    private static boolean isBlank(String s) { return s == null || s.isBlank(); }
    private static int clamp(int n) { return Math.max(0, Math.min(100, n)); }
}
