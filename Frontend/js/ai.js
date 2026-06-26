/**
 * ai.js — AI Copilot panel rendering.
 * Renders the AI review result: summary, confidence bar, suggestions, warnings.
 */

import { confidenceColor } from "./utils.js";

/**
 * Render the AI review panel.
 * Accepts either a raw AiReviewResponse or the AuthorizationRequest
 * (which has aiReviewed, aiReviewSummary, aiConfidenceScore, aiSuggestions).
 */
export function renderAiPanel(data) {
  const score = data.aiConfidenceScore ?? data.confidenceScore ?? 0;
  const summary = data.aiReviewSummary ?? data.summary ?? "";
  const suggestions = data.aiSuggestions ?? data.suggestions ?? [];
  const warnings = data.warnings ?? [];
  const missing = data.missingInfo ?? [];
  const fhirNotes = data.fhirComplianceNotes ?? "";
  const ready = data.readyToSubmit;

  const readyBadge =
    ready !== undefined
      ? ready
        ? '<span class="badge badge-approved">✅ Ready to Submit</span>'
        : '<span class="badge badge-pending">⚠️ Needs Attention</span>'
      : "";

  return `
<div class="ai-panel mb-4">
  <div class="ai-panel-header">
    <div class="ai-icon">🤖</div>
    <div>
      <div class="ai-title">AI Copilot Review</div>
      <div class="ai-subtitle">Powered by Claude · FHIR R4 Da Vinci PAS analysis</div>
    </div>
    <div style="margin-left:auto">${readyBadge}</div>
  </div>

  ${summary ? `<div style="font-size:13px;color:var(--text-secondary);margin-bottom:14px;line-height:1.5">${summary}</div>` : ""}

  <div class="confidence-bar-wrap">
    <div class="confidence-label">
      <span style="font-weight:600;color:var(--text-secondary)">Approval Likelihood</span>
      <span class="confidence-score">${score}%</span>
    </div>
    <div class="confidence-bar">
      <div class="confidence-fill" style="width:${score}%;background:${confidenceColor(score)}"></div>
    </div>
  </div>

  <div class="ai-grid">
    ${_aiSection(suggestions, "💡 Suggestions", "var(--purple)", (s) => `<div class="ai-item"><span class="ai-item-icon">→</span><span>${s}</span></div>`)}
    ${_aiSection(warnings, "⚠️ Warnings", "var(--red)", (w) => `<div class="ai-item"><span class="ai-item-icon">⚠️</span><span>${w}</span></div>`)}
    ${_aiSection(missing, "📋 Missing Info", "var(--yellow)", (m) => `<div class="ai-item"><span class="ai-item-icon">❌</span><span>${m}</span></div>`)}
    ${fhirNotes ? _fhirSection(fhirNotes) : ""}
  </div>
</div>`;
}

function _aiSection(items, label, color, rowFn) {
  if (!items?.length) return "";
  return `
  <div>
    <div class="ai-section-label" style="color:${color}">${label}</div>
    <div class="ai-items">${items.map(rowFn).join("")}</div>
  </div>`;
}

function _fhirSection(notes) {
  return `
  <div>
    <div class="ai-section-label" style="color:var(--accent)">🔗 FHIR Compliance</div>
    <div class="ai-item"><span class="ai-item-icon">ℹ️</span><span style="font-size:12.5px">${notes}</span></div>
  </div>`;
}
