import type { AuthRequest, CopilotIssue, CopilotReview } from "./types";

// ─────────────────────────────────────────────────────────────────────────────
// AuthBridge AI Copilot — request analysis engine.
//
// This module produces a structured CopilotReview: completeness score, approval
// likelihood, a list of actionable issues, and a suggested clinical narrative.
//
// It ships with a deterministic, dependency-free RULES engine so the platform
// is fully demonstrable with zero API keys. The same function shape is what an
// LLM-backed implementation returns — to enable it, set ANTHROPIC_API_KEY and
// implement `reviewWithLLM` (see the stub at the bottom). The API route in
// app/api/copilot/route.ts decides which path to take.
// ─────────────────────────────────────────────────────────────────────────────

const CPT_PATTERN = /^\d{5}$/;
const ICD10_PATTERN = /^[A-TV-Z][0-9][0-9AB](?:\.[0-9A-Z]{1,4})?$/i;

export function reviewWithRules(req: Partial<AuthRequest>): CopilotReview {
  const issues: CopilotIssue[] = [];

  // 1. Required clinical identifiers ------------------------------------------
  if (!req.serviceRequested?.trim()) {
    issues.push({
      severity: "ERROR",
      field: "serviceRequested",
      title: "Requested service is missing",
      detail: "Payers cannot adjudicate without a clearly named procedure or service.",
      suggestion: "Name the specific procedure, e.g. 'MRI lumbar spine without contrast'.",
    });
  }

  if (!req.cptCodes?.length) {
    issues.push({
      severity: "ERROR",
      field: "cptCodes",
      title: "No CPT/HCPCS code provided",
      detail: "At least one procedure code is required for medical-necessity review.",
      suggestion: "Add the CPT code that matches the requested service (e.g. 72148 for lumbar MRI).",
    });
  } else {
    const bad = req.cptCodes.filter((c) => !CPT_PATTERN.test(c.trim()));
    if (bad.length) {
      issues.push({
        severity: "WARNING",
        field: "cptCodes",
        title: `Malformed CPT code(s): ${bad.join(", ")}`,
        detail: "CPT codes are 5 numeric digits. Malformed codes are a top cause of automatic rejection.",
        suggestion: "Re-check the codes against the current CPT code set.",
      });
    }
  }

  if (!req.icd10Codes?.length) {
    issues.push({
      severity: "ERROR",
      field: "icd10Codes",
      title: "No ICD-10 diagnosis code provided",
      detail: "A supporting diagnosis is required to establish medical necessity.",
      suggestion: "Add the ICD-10 code describing the condition that justifies the service.",
    });
  } else {
    const bad = req.icd10Codes.filter((c) => !ICD10_PATTERN.test(c.trim()));
    if (bad.length) {
      issues.push({
        severity: "WARNING",
        field: "icd10Codes",
        title: `ICD-10 code format looks off: ${bad.join(", ")}`,
        detail: "ICD-10-CM codes start with a letter followed by digits (e.g. M54.16).",
        suggestion: "Verify the diagnosis code format.",
      });
    }
  }

  // 2. Clinical justification quality -----------------------------------------
  const justification = req.clinicalJustification?.trim() ?? "";
  if (!justification) {
    issues.push({
      severity: "ERROR",
      field: "clinicalJustification",
      title: "Clinical justification is empty",
      detail: "A medical-necessity narrative is the single biggest driver of approval.",
      suggestion: "Describe symptoms, duration, failed conservative treatment, and expected benefit.",
    });
  } else if (justification.length < 120) {
    issues.push({
      severity: "WARNING",
      field: "clinicalJustification",
      title: "Justification is thin",
      detail: "Short narratives are frequently returned with a request for additional information.",
      suggestion: "Include conservative therapies already tried and their outcomes.",
    });
  }

  const mentionsConservative = /(physical therapy|conservative|nsaid|medication|tried|failed)/i.test(
    justification,
  );
  if (justification && !mentionsConservative) {
    issues.push({
      severity: "INFO",
      field: "clinicalJustification",
      title: "No mention of conservative treatment",
      detail: "Most payer policies require documentation that conservative care was attempted first.",
      suggestion: "State which conservative treatments were tried and over what period.",
    });
  }

  // 3. Supporting documents ----------------------------------------------------
  if (!req.documents?.length) {
    issues.push({
      severity: "WARNING",
      field: "documents",
      title: "No supporting documents attached",
      detail: "Clinical notes or imaging reports substantially increase first-pass approval.",
      suggestion: "Attach the relevant clinical notes, labs, or imaging.",
    });
  }

  // 4. Internal consistency ----------------------------------------------------
  if ((req.requestedUnits ?? 0) <= 0) {
    issues.push({
      severity: "WARNING",
      field: "requestedUnits",
      title: "Requested units not specified",
      detail: "Unit count is required for visit- or session-based services.",
      suggestion: "Set the number of units/visits being requested.",
    });
  }

  // ─── Scoring ──────────────────────────────────────────────────────────────
  const errors = issues.filter((i) => i.severity === "ERROR").length;
  const warnings = issues.filter((i) => i.severity === "WARNING").length;
  const infos = issues.filter((i) => i.severity === "INFO").length;

  let completeness = 100 - errors * 22 - warnings * 9 - infos * 3;
  completeness = clamp(completeness);

  // Approval likelihood blends completeness with positive clinical signals.
  let approval = completeness;
  if (mentionsConservative) approval += 6;
  if ((req.documents?.length ?? 0) >= 2) approval += 6;
  if (req.priority === "STAT") approval -= 4; // urgent requests get extra scrutiny
  approval = clamp(approval - errors * 8);

  const summary = buildSummary(req, completeness, approval, errors, warnings);

  return {
    completenessScore: Math.round(completeness),
    approvalLikelihood: Math.round(approval),
    issues,
    summary,
    suggestedNarrative: justification ? undefined : buildSuggestedNarrative(req),
    generatedBy: "rules",
    generatedAt: new Date().toISOString(),
  };
}

function buildSummary(
  req: Partial<AuthRequest>,
  completeness: number,
  approval: number,
  errors: number,
  warnings: number,
): string {
  const service = req.serviceRequested?.trim() || "the requested service";
  if (errors > 0) {
    return `This request for ${service} is not ready to submit. ${errors} blocking issue${
      errors > 1 ? "s" : ""
    } must be resolved first. Estimated approval likelihood is ${Math.round(approval)}% as written.`;
  }
  if (warnings > 0) {
    return `This request for ${service} is submittable but can be strengthened. Addressing the ${warnings} flagged item${
      warnings > 1 ? "s" : ""
    } would raise the approval likelihood above the current ${Math.round(approval)}%.`;
  }
  return `This request for ${service} looks complete and well-documented. Estimated approval likelihood is ${Math.round(
    approval,
  )}%.`;
}

function buildSuggestedNarrative(req: Partial<AuthRequest>): string {
  const svc = req.serviceRequested?.trim() || "[service]";
  const dx = req.icd10Codes?.[0] || "[diagnosis]";
  return (
    `Patient presents with ${dx}. Conservative management (e.g. NSAIDs and physical therapy) ` +
    `has been attempted for [duration] without adequate improvement. ${svc} is requested to ` +
    `[clarify diagnosis / guide treatment]. Expected clinical benefit: [describe]. ` +
    `Supporting documentation attached.`
  );
}

function clamp(n: number): number {
  return Math.max(0, Math.min(100, n));
}

// ─── Optional LLM path (Claude) ─────────────────────────────────────────────
// Implement this to upgrade from rules to a Claude-backed reviewer. Keep the
// return shape identical to reviewWithRules. The system prompt should instruct
// the model to return JSON matching the CopilotReview schema, and the rules
// output above makes an excellent few-shot example / fallback.
//
// export async function reviewWithLLM(req: Partial<AuthRequest>): Promise<CopilotReview> {
//   const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
//   const msg = await anthropic.messages.create({
//     model: "claude-opus-4-8",
//     max_tokens: 1500,
//     system: COPILOT_SYSTEM_PROMPT,
//     messages: [{ role: "user", content: JSON.stringify(req) }],
//     tools: [{ name: "emit_review", input_schema: COPILOT_REVIEW_SCHEMA }],
//     tool_choice: { type: "tool", name: "emit_review" },
//   });
//   // parse tool_use block → CopilotReview, mark generatedBy: "llm"
// }
