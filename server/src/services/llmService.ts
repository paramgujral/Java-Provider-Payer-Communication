import { config, isLlmConfigured } from '../config.js';
import type {
  AIRecommendation,
  AIValidationIssue,
  AIValidationResult,
  ClaimFormData,
  PayerReviewResult,
} from '../types.js';

export interface LlmProviderEnrichment {
  issues: AIValidationIssue[];
  recommendations: AIRecommendation[];
  scoreAdjustment: number;
  clinicalSummary: string;
  codingNotes: string;
}

export interface LlmPayerEnrichment {
  riskFlags: PayerReviewResult['riskFlags'];
  suggestedAction?: PayerReviewResult['suggestedAction'];
  summary: string;
  medicalNecessity: string;
  confidenceAdjustment: number;
}

export interface AiEngineStatus {
  llmConfigured: boolean;
  llmEnabled: boolean;
  model: string;
  mode: 'hybrid' | 'rules_only';
}

export function getAiEngineStatus(): AiEngineStatus {
  const llmConfigured = isLlmConfigured();
  return {
    llmConfigured,
    llmEnabled: config.ai.llmEnabled,
    model: config.openai.model,
    mode: llmConfigured ? 'hybrid' : 'rules_only',
  };
}

async function chatJson<T>(system: string, user: string): Promise<T | null> {
  if (!isLlmConfigured()) return null;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.openai.timeoutMs);

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.openai.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: config.openai.model,
        temperature: 0.2,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('[LLM] API error:', res.status, err.slice(0, 200));
      return null;
    }

    const body = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = body.choices?.[0]?.message?.content;
    if (!content) return null;
    return JSON.parse(content) as T;
  } catch (e) {
    console.error('[LLM] Request failed:', e instanceof Error ? e.message : e);
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

const PROVIDER_SYSTEM = `You are a clinical prior authorization co-pilot for US healthcare.
Analyze authorization request data. Respond ONLY with valid JSON matching this schema:
{
  "issues": [{ "field": string, "severity": "error"|"warning"|"info", "message": string }],
  "recommendations": [{ "field": string, "suggestion": string, "reason": string }],
  "scoreAdjustment": number (-15 to 5),
  "clinicalSummary": string,
  "codingNotes": string
}
Rules:
- Do NOT invent patient facts not in the input.
- Prefer ICD-10-CM and CPT codes; flag likely coding mismatches.
- scoreAdjustment: negative if quality concerns, small positive if strong documentation.
- Keep issues/recommendations concise and actionable.
- Never mark required fields as optional.`;

const PAYER_SYSTEM = `You are a payer prior authorization review assistant for US health insurance.
Analyze the authorization request. Respond ONLY with valid JSON:
{
  "riskFlags": [{ "field": string, "message": string, "severity": "low"|"medium"|"high" }],
  "suggestedAction": "approve"|"reject"|"request_revision"|"review_manually",
  "summary": string,
  "medicalNecessity": string,
  "confidenceAdjustment": number (-20 to 10)
}
Rules:
- Base analysis only on provided data.
- Flag medical necessity gaps, unusual billing, coding inconsistencies.
- Be conservative on approve for high amounts or incomplete clinical notes.`;

function formSnapshot(data: ClaimFormData): string {
  return JSON.stringify(
    {
      patient_name: data.patient_name,
      patient_id: data.patient_id,
      patient_dob: data.patient_dob,
      patient_gender: data.patient_gender,
      insurance_policy_number: data.insurance_policy_number,
      diagnosis_code: data.diagnosis_code,
      diagnosis_description: data.diagnosis_description,
      procedure_code: data.procedure_code,
      procedure_description: data.procedure_description,
      claim_amount: data.claim_amount,
      service_date: data.service_date,
      provider_notes: data.provider_notes,
    },
    null,
    2
  );
}

export async function enrichProviderValidation(
  data: ClaimFormData,
  rulesResult: AIValidationResult
): Promise<LlmProviderEnrichment | null> {
  const user = `Authorization request JSON:
${formSnapshot(data)}

Rule engine result (baseline score ${rulesResult.score}/100, valid=${rulesResult.valid}):
${JSON.stringify({ issues: rulesResult.issues, recommendations: rulesResult.recommendations })}

Provide ADDITIONAL insights beyond rules. Do not duplicate exact rule messages.`;

  return chatJson<LlmProviderEnrichment>(PROVIDER_SYSTEM, user);
}

export async function enrichPayerReview(
  data: ClaimFormData,
  rulesResult: PayerReviewResult
): Promise<LlmPayerEnrichment | null> {
  const user = `Authorization request:
${formSnapshot(data)}

Rule-based review:
${JSON.stringify({
  suggestedAction: rulesResult.suggestedAction,
  confidence: rulesResult.confidence,
  autoCorrections: rulesResult.autoCorrections,
  riskFlags: rulesResult.riskFlags,
})}

Provide payer-focused medical necessity and risk analysis.`;

  return chatJson<LlmPayerEnrichment>(PAYER_SYSTEM, user);
}

export function mergeProviderResults(
  rules: AIValidationResult,
  llm: LlmProviderEnrichment | null
): AIValidationResult {
  if (!llm) {
    return { ...rules, engine: 'rules', llmInsight: null };
  }

  const issueKeys = new Set(rules.issues.map((i) => `${i.field}:${i.message}`));
  const extraIssues = (llm.issues || []).filter(
    (i) => i.field && i.message && !issueKeys.has(`${i.field}:${i.message}`)
  );

  const recKeys = new Set(rules.recommendations.map((r) => `${r.field}:${r.suggestion}`));
  const extraRecs = (llm.recommendations || []).filter(
    (r) => r.field && r.suggestion && !recKeys.has(`${r.field}:${r.suggestion}`)
  );

  const adjustment = Math.max(-15, Math.min(5, llm.scoreAdjustment || 0));
  let score = Math.max(0, Math.min(100, rules.score + adjustment));
  const hasErrors = rules.issues.some((i) => i.severity === 'error');

  const llmInsight = [llm.clinicalSummary, llm.codingNotes].filter(Boolean).join(' ').trim() || null;

  return {
    valid: !hasErrors && score >= 60,
    score,
    issues: [...rules.issues, ...extraIssues],
    recommendations: [...rules.recommendations, ...extraRecs],
    engine: 'hybrid',
    llmInsight,
  };
}

export function mergePayerResults(
  rules: PayerReviewResult,
  llm: LlmPayerEnrichment | null
): PayerReviewResult {
  if (!llm) {
    return { ...rules, engine: 'rules' };
  }

  const flagKeys = new Set(rules.riskFlags.map((f) => f.message));
  const extraFlags = (llm.riskFlags || []).filter((f) => f.message && !flagKeys.has(f.message));

  const adjustment = Math.max(-20, Math.min(10, llm.confidenceAdjustment || 0));
  const confidence = Math.max(0, Math.min(99, rules.confidence + adjustment));

  const suggestedAction = llm.suggestedAction || rules.suggestedAction;

  const summaryParts = [llm.summary || rules.summary];
  if (llm.medicalNecessity) summaryParts.push(`Medical necessity: ${llm.medicalNecessity}`);

  return {
    ...rules,
    riskFlags: [...rules.riskFlags, ...extraFlags],
    suggestedAction,
    confidence,
    summary: summaryParts.join(' '),
    engine: 'hybrid',
    llmInsight: llm.medicalNecessity || null,
  };
}
