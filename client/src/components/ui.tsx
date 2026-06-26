import type { ClaimStatus } from '../types';

const STATUS_CONFIG: Record<ClaimStatus, { label: string; className: string }> = {
  draft: { label: 'Draft', className: 'bg-slate-100 text-slate-700' },
  submitted: { label: 'Submitted', className: 'bg-blue-100 text-blue-700' },
  under_review: { label: 'Under Review', className: 'bg-amber-100 text-amber-700' },
  approved: { label: 'Approved', className: 'bg-emerald-100 text-emerald-700' },
  rejected: { label: 'Rejected', className: 'bg-red-100 text-red-700' },
  revision_requested: { label: 'Revision Needed', className: 'bg-orange-100 text-orange-700' },
};

export function StatusBadge({ status }: { status: ClaimStatus }) {
  const config = STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  );
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

export function formatDate(dateStr: string | null) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export const FIELD_LABELS: Record<string, string> = {
  patient_name: 'Patient Name',
  patient_id: 'Patient ID',
  patient_dob: 'Date of Birth',
  patient_gender: 'Gender',
  insurance_policy_number: 'Policy Number',
  diagnosis_code: 'Diagnosis Code',
  diagnosis_description: 'Diagnosis',
  procedure_code: 'Procedure Code',
  procedure_description: 'Procedure',
  claim_amount: 'Claim Amount',
  service_date: 'Service Date',
  provider_notes: 'Clinical Notes',
  payer_id: 'Insurance Payer',
};
