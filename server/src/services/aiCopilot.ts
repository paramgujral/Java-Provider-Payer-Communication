import type {
  AIRecommendation,
  AIValidationIssue,
  AIValidationResult,
  ClaimFormData,
  PayerReviewResult,
} from '../types.js';
import {
  enrichPayerReview,
  enrichProviderValidation,
  mergePayerResults,
  mergeProviderResults,
} from './llmService.js';

const ICD10_PATTERN = /^[A-Z]\d{2}(\.\d{1,4})?$/i;
const CPT_PATTERN = /^\d{5}$/;
const POLICY_PATTERN = /^[A-Z0-9]{8,16}$/i;

const DIAGNOSIS_HINTS: Record<string, string> = {
  diabetes: 'E11.9',
  hypertension: 'I10',
  pneumonia: 'J18.9',
  fracture: 'S72.001A',
  asthma: 'J45.909',
  migraine: 'G43.909',
  covid: 'U07.1',
  heart: 'I25.10',
};

const PROCEDURE_HINTS: Record<string, string> = {
  'office visit': '99213',
  'lab test': '80053',
  xray: '71046',
  mri: '70553',
  surgery: '47562',
  consultation: '99244',
  emergency: '99285',
};

function isValidDate(dateStr: string): boolean {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  return !isNaN(d.getTime());
}

function isFutureDate(dateStr: string): boolean {
  if (!isValidDate(dateStr)) return false;
  return new Date(dateStr) > new Date();
}

function calculateAge(dob: string): number | null {
  if (!isValidDate(dob)) return null;
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

export function validateClaimFormRules(data: ClaimFormData): AIValidationResult {
  const issues: AIValidationIssue[] = [];
  const recommendations: AIRecommendation[] = [];
  let score = 100;

  const requiredFields: { key: keyof ClaimFormData; label: string }[] = [
    { key: 'patient_name', label: 'Patient Name' },
    { key: 'patient_id', label: 'Patient ID' },
    { key: 'patient_dob', label: 'Date of Birth' },
    { key: 'patient_gender', label: 'Gender' },
    { key: 'insurance_policy_number', label: 'Insurance Policy Number' },
    { key: 'diagnosis_code', label: 'Diagnosis Code (ICD-10)' },
    { key: 'diagnosis_description', label: 'Diagnosis Description' },
    { key: 'procedure_code', label: 'Procedure Code (CPT)' },
    { key: 'procedure_description', label: 'Procedure Description' },
    { key: 'claim_amount', label: 'Claim Amount' },
    { key: 'service_date', label: 'Service Date' },
  ];

  for (const { key, label } of requiredFields) {
    const val = data[key];
    if (val === undefined || val === null || val === '' || val === 0) {
      issues.push({ field: key, severity: 'error', message: `${label} is required` });
      score -= 8;
    }
  }

  if (data.patient_name && data.patient_name.trim().split(' ').length < 2) {
    issues.push({
      field: 'patient_name',
      severity: 'warning',
      message: 'Full name (first and last) is recommended',
    });
    score -= 3;
    recommendations.push({
      field: 'patient_name',
      suggestion: 'Include both first and last name',
      reason: 'Incomplete names cause claim processing delays',
    });
  }

  if (data.patient_dob) {
    const age = calculateAge(data.patient_dob);
    if (age === null) {
      issues.push({ field: 'patient_dob', severity: 'error', message: 'Invalid date of birth format' });
      score -= 10;
    } else if (age < 0 || age > 120) {
      issues.push({ field: 'patient_dob', severity: 'error', message: 'Date of birth appears invalid' });
      score -= 10;
    }
  }

  if (data.patient_gender && !['male', 'female', 'other'].includes(data.patient_gender.toLowerCase())) {
    issues.push({
      field: 'patient_gender',
      severity: 'warning',
      message: 'Use Male, Female, or Other',
    });
    score -= 2;
  }

  if (data.insurance_policy_number && !POLICY_PATTERN.test(data.insurance_policy_number.replace(/[-\s]/g, ''))) {
    issues.push({
      field: 'insurance_policy_number',
      severity: 'warning',
      message: 'Policy number format may be incorrect (expected 8-16 alphanumeric characters)',
    });
    score -= 5;
    recommendations.push({
      field: 'insurance_policy_number',
      suggestion: 'Verify policy number on insurance card',
      reason: 'Invalid policy numbers are the #1 cause of claim rejection',
    });
  }

  if (data.diagnosis_code && !ICD10_PATTERN.test(data.diagnosis_code)) {
    issues.push({
      field: 'diagnosis_code',
      severity: 'warning',
      message: 'ICD-10 code format should be like E11.9 or J18.9',
    });
    score -= 5;
  }

  if (data.diagnosis_description && !data.diagnosis_code) {
    const desc = data.diagnosis_description.toLowerCase();
    for (const [keyword, code] of Object.entries(DIAGNOSIS_HINTS)) {
      if (desc.includes(keyword)) {
        recommendations.push({
          field: 'diagnosis_code',
          suggestion: code,
          reason: `Based on "${data.diagnosis_description}", ICD-10 code ${code} is commonly used`,
        });
        break;
      }
    }
  }

  if (data.diagnosis_code && data.diagnosis_description) {
    const desc = data.diagnosis_description.toLowerCase();
    const code = data.diagnosis_code.toUpperCase();
    const mismatch =
      (code.startsWith('E') && !desc.includes('diabet') && !desc.includes('endocrine')) ||
      (code.startsWith('I') && !desc.includes('heart') && !desc.includes('hypertens') && !desc.includes('cardiac'));
    if (mismatch) {
      issues.push({
        field: 'diagnosis_code',
        severity: 'info',
        message: 'Diagnosis code may not match the description — please verify',
      });
      score -= 3;
    }
  }

  if (data.procedure_code && !CPT_PATTERN.test(data.procedure_code)) {
    issues.push({
      field: 'procedure_code',
      severity: 'warning',
      message: 'CPT code should be a 5-digit number (e.g., 99213)',
    });
    score -= 5;
  }

  if (data.procedure_description && !data.procedure_code) {
    const desc = data.procedure_description.toLowerCase();
    for (const [keyword, code] of Object.entries(PROCEDURE_HINTS)) {
      if (desc.includes(keyword)) {
        recommendations.push({
          field: 'procedure_code',
          suggestion: code,
          reason: `Based on "${data.procedure_description}", CPT code ${code} is commonly used`,
        });
        break;
      }
    }
  }

  if (data.service_date) {
    if (!isValidDate(data.service_date)) {
      issues.push({ field: 'service_date', severity: 'error', message: 'Invalid service date' });
      score -= 10;
    } else if (isFutureDate(data.service_date)) {
      issues.push({ field: 'service_date', severity: 'error', message: 'Service date cannot be in the future' });
      score -= 10;
    } else {
      const serviceDate = new Date(data.service_date);
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      if (serviceDate < oneYearAgo) {
        issues.push({
          field: 'service_date',
          severity: 'warning',
          message: 'Service date is over 1 year old — may exceed filing deadline',
        });
        score -= 5;
      }
    }
  }

  if (data.claim_amount !== undefined && data.claim_amount !== null) {
    if (data.claim_amount <= 0) {
      issues.push({ field: 'claim_amount', severity: 'error', message: 'Claim amount must be greater than zero' });
      score -= 10;
    } else if (data.claim_amount > 500000) {
      issues.push({
        field: 'claim_amount',
        severity: 'warning',
        message: 'Claim amount exceeds $500,000 — additional documentation may be required',
      });
      score -= 5;
    } else if (data.procedure_code === '99213' && data.claim_amount > 500) {
      recommendations.push({
        field: 'claim_amount',
        suggestion: String(Math.min(data.claim_amount, 250)),
        reason: 'Standard office visit (99213) typically billed at $150-$250',
      });
    }
  }

  if (!data.provider_notes || data.provider_notes.trim().length < 10) {
    recommendations.push({
      field: 'provider_notes',
      suggestion: 'Add clinical notes describing the treatment provided',
      reason: 'Detailed notes speed up payer review and reduce revision requests',
    });
    score -= 2;
  }

  score = Math.max(0, Math.min(100, score));
  const hasErrors = issues.some((i) => i.severity === 'error');

  return {
    valid: !hasErrors && score >= 60,
    score,
    issues,
    recommendations,
    engine: 'rules',
    llmInsight: null,
  };
}

/** Hybrid validation: rules gate submit; LLM enriches when configured */
export async function validateClaimForm(data: ClaimFormData): Promise<AIValidationResult> {
  const rules = validateClaimFormRules(data);
  const llm = await enrichProviderValidation(data, rules);
  return mergeProviderResults(rules, llm);
}

export function reviewClaimForPayerRules(data: ClaimFormData): PayerReviewResult {
  const validation = validateClaimFormRules(data);
  const autoCorrections: PayerReviewResult['autoCorrections'] = [];
  const riskFlags: PayerReviewResult['riskFlags'] = [];

  if (data.diagnosis_code && data.diagnosis_code !== data.diagnosis_code.toUpperCase()) {
    autoCorrections.push({
      field: 'diagnosis_code',
      original: data.diagnosis_code,
      corrected: data.diagnosis_code.toUpperCase(),
      reason: 'ICD-10 codes must be uppercase',
    });
  }

  if (data.insurance_policy_number) {
    const cleaned = data.insurance_policy_number.replace(/[-\s]/g, '').toUpperCase();
    if (cleaned !== data.insurance_policy_number) {
      autoCorrections.push({
        field: 'insurance_policy_number',
        original: data.insurance_policy_number,
        corrected: cleaned,
        reason: 'Removed spaces/dashes from policy number',
      });
    }
  }

  if (data.patient_name) {
    const proper = data.patient_name
      .split(' ')
      .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');
    if (proper !== data.patient_name) {
      autoCorrections.push({
        field: 'patient_name',
        original: data.patient_name,
        corrected: proper,
        reason: 'Standardized name capitalization',
      });
    }
  }

  if (data.claim_amount && data.claim_amount > 100000) {
    riskFlags.push({
      field: 'claim_amount',
      message: 'High-value claim requires senior reviewer approval',
      severity: 'high',
    });
  }

  if (validation.score < 50) {
    riskFlags.push({
      field: 'general',
      message: 'Multiple data quality issues detected',
      severity: 'high',
    });
  } else if (validation.score < 75) {
    riskFlags.push({
      field: 'general',
      message: 'Some fields need verification',
      severity: 'medium',
    });
  }

  const errorCount = validation.issues.filter((i: AIValidationIssue) => i.severity === 'error').length;
  let suggestedAction: PayerReviewResult['suggestedAction'] = 'approve';
  if (errorCount > 2) suggestedAction = 'reject';
  else if (errorCount > 0 || validation.score < 60) suggestedAction = 'request_revision';
  else if (validation.score < 80 || riskFlags.some((f: PayerReviewResult['riskFlags'][number]) => f.severity === 'high')) suggestedAction = 'review_manually';

  const confidence = Math.min(95, validation.score + 10);

  return {
    autoCorrections,
    riskFlags,
    suggestedAction,
    confidence,
    summary: buildReviewSummary(validation, autoCorrections, riskFlags, suggestedAction),
    engine: 'rules',
    llmInsight: null,
  };
}

/** Hybrid payer review with optional LLM enrichment */
export async function reviewClaimForPayer(data: ClaimFormData): Promise<PayerReviewResult> {
  const rules = reviewClaimForPayerRules(data);
  const llm = await enrichPayerReview(data, rules);
  return mergePayerResults(rules, llm);
}

function buildReviewSummary(
  validation: AIValidationResult,
  corrections: PayerReviewResult['autoCorrections'],
  flags: PayerReviewResult['riskFlags'],
  action: PayerReviewResult['suggestedAction']
): string {
  const parts: string[] = [];
  parts.push(`AI quality score: ${validation.score}/100.`);
  if (corrections.length) parts.push(`${corrections.length} auto-correction(s) available.`);
  if (flags.length) parts.push(`${flags.length} risk flag(s) identified.`);
  parts.push(`Suggested action: ${action.replace(/_/g, ' ')}.`);
  return parts.join(' ');
}
