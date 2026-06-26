import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  AlertTriangle,
  Bot,
  CheckCircle,
  Clock,
  Edit,
  Send,
  Sparkles,
  XCircle,
} from 'lucide-react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { StatusBadge, formatCurrency, formatDate, FIELD_LABELS } from '../components/ui';
import { FhirPanel } from '../components/FhirPanel';
import type { Claim, ClaimEvent, PayerReviewResult } from '../types';

export function ClaimDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [claim, setClaim] = useState<Claim | null>(null);
  const [events, setEvents] = useState<ClaimEvent[]>([]);
  const [aiReview, setAiReview] = useState<PayerReviewResult | null>(null);
  const [aiReviewLoading, setAiReviewLoading] = useState(false);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');
  const [error, setError] = useState('');

  const isProvider = user?.role === 'provider';
  const isPayer = user?.role === 'payer';
  const canEdit = isProvider && claim && ['draft', 'revision_requested'].includes(claim.status);
  const canReview = isPayer && claim && ['submitted', 'under_review'].includes(claim.status);

  const load = async () => {
    if (!id) return;
    const [c, e] = await Promise.all([api.getClaim(id), api.getClaimEvents(id)]);
    setClaim(c);
    setEvents(e);
    if (user?.role === 'payer' && c.status !== 'draft') {
      setAiReviewLoading(true);
      try {
        const review = await api.reviewClaim({ ...c, payer_id: c.payer_id ?? undefined });
        setAiReview(review);
      } finally {
        setAiReviewLoading(false);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [id, user?.role]);

  const handleResubmit = async () => {
    if (!user || !id) return;
    setActionLoading('resubmit');
    setError('');
    try {
      const updated = await api.submitClaim(id, user.id);
      setClaim(updated);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Resubmit failed. Edit the claim and fix validation errors first.');
    } finally {
      setActionLoading('');
    }
  };

  const handleAction = async (action: string, applyCorrections = false) => {
    if (!user || !id) return;
    setActionLoading(action);
    setError('');
    try {
      const updated = await api.reviewClaimAction(id, user.id, action, notes || undefined, applyCorrections);
      setClaim(updated);
      setNotes('');
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Action failed');
    } finally {
      setActionLoading('');
    }
  };

  if (loading || !claim) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-3 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const fields: { label: string; value: string }[] = [
    { label: 'Patient Name', value: claim.patient_name },
    { label: 'Patient ID', value: claim.patient_id },
    { label: 'Date of Birth', value: claim.patient_dob },
    { label: 'Gender', value: claim.patient_gender },
    { label: 'Policy Number', value: claim.insurance_policy_number },
    { label: 'Diagnosis Code', value: claim.diagnosis_code },
    { label: 'Diagnosis', value: claim.diagnosis_description },
    { label: 'Procedure Code', value: claim.procedure_code },
    { label: 'Procedure', value: claim.procedure_description },
    { label: 'Claim Amount', value: formatCurrency(claim.claim_amount) },
    { label: 'Service Date', value: claim.service_date },
    { label: 'Clinical Notes', value: claim.provider_notes },
  ];

  const actionColors: Record<string, string> = {
    approve: 'bg-emerald-600 hover:bg-emerald-700',
    reject: 'bg-red-600 hover:bg-red-700',
    request_revision: 'bg-orange-600 hover:bg-orange-700',
    start_review: 'bg-amber-600 hover:bg-amber-700',
  };

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900">{claim.patient_name || 'Claim Details'}</h1>
            <StatusBadge status={claim.status} />
          </div>
          <p className="text-slate-500 mt-1">
            Auth Request ID: {claim.id.slice(0, 8)}...
            {claim.auth_number && <> · Auth #: <span className="font-medium text-emerald-600">{claim.auth_number}</span></>}
            {' · '}AI Score: {claim.ai_score ?? '—'}/100
          </p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              to={`/provider/claims/${claim.id}/edit`}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-medium"
            >
              <Edit className="w-4 h-4" /> Edit Claim
            </Link>
            {claim.status === 'revision_requested' && (
              <button
                onClick={handleResubmit}
                disabled={!!actionLoading}
                className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 text-sm font-medium disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                {actionLoading === 'resubmit' ? 'Submitting...' : 'Resubmit to Payer'}
              </button>
            )}
          </div>
        )}
      </div>

      {error && <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg">{error}</div>}

      {claim.status === 'revision_requested' && claim.payer_notes && (
        <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-xl">
          <p className="font-medium text-orange-800">Payer Revision Request</p>
          <p className="text-sm text-orange-700 mt-1">{claim.payer_notes}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="font-semibold text-slate-900 mb-4">Claim Information</h2>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {fields.map(({ label, value }) => (
                <div key={label}>
                  <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</dt>
                  <dd className="text-sm text-slate-900 mt-0.5">{value || '—'}</dd>
                </div>
              ))}
            </dl>
          </div>

          {canReview && (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="bg-gradient-to-r from-violet-600 to-brand-600 px-5 py-3 flex items-center gap-2 text-white">
                <Bot className="w-5 h-5" />
                <h2 className="font-semibold">AI Review Assistant</h2>
                {aiReview?.engine === 'hybrid' && (
                  <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full ml-1">GPT</span>
                )}
                <Sparkles className="w-4 h-4 ml-auto opacity-75" />
              </div>
              <div className="p-5 space-y-4">
                {aiReviewLoading ? (
                  <p className="text-sm text-slate-500 animate-pulse">Analyzing claim with AI…</p>
                ) : aiReview ? (
                  <>
                <p className="text-sm text-slate-700">{aiReview.summary}</p>
                <div className="flex items-center gap-4">
                  <div>
                    <span className="text-xs text-slate-500">Confidence</span>
                    <p className="text-lg font-bold text-violet-600">{aiReview.confidence}%</p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500">Suggested Action</span>
                    <p className="text-sm font-semibold text-slate-900 capitalize">
                      {aiReview.suggestedAction.replace(/_/g, ' ')}
                    </p>
                  </div>
                </div>

                {aiReview.autoCorrections.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold text-slate-500 uppercase mb-2">Auto-Corrections</h3>
                    <div className="space-y-2">
                      {aiReview.autoCorrections.map((c, i) => (
                        <div key={i} className="p-3 bg-violet-50 rounded-lg text-sm">
                          <span className="font-medium">{FIELD_LABELS[c.field] || c.field}</span>
                          <p className="text-slate-600 mt-0.5">
                            <span className="line-through text-red-500">{c.original}</span>
                            {' → '}
                            <span className="text-emerald-600 font-medium">{c.corrected}</span>
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">{c.reason}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {aiReview.riskFlags.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold text-slate-500 uppercase mb-2">Risk Flags</h3>
                    <div className="space-y-2">
                      {aiReview.riskFlags.map((f, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm">
                          <AlertTriangle
                            className={`w-4 h-4 shrink-0 ${
                              f.severity === 'high' ? 'text-red-500' : f.severity === 'medium' ? 'text-amber-500' : 'text-blue-500'
                            }`}
                          />
                          <span className="text-slate-700">{f.message}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {aiReview.llmInsight && (
                  <div className="p-3 bg-violet-50 rounded-lg text-sm border border-violet-100">
                    <p className="text-xs font-semibold text-violet-700 uppercase tracking-wide mb-1">Medical Necessity (LLM)</p>
                    <p className="text-slate-700">{aiReview.llmInsight}</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Review Notes</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm h-20 resize-none focus:ring-2 focus:ring-violet-500 outline-none"
                    placeholder="Add notes for the provider (required for rejection/revision)..."
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  {claim.status === 'submitted' && (
                    <button
                      onClick={() => handleAction('start_review')}
                      disabled={!!actionLoading}
                      className={`px-4 py-2 text-white rounded-lg text-sm font-medium ${actionColors.start_review} disabled:opacity-50`}
                    >
                      <Clock className="w-4 h-4 inline mr-1" />
                      {actionLoading === 'start_review' ? 'Processing...' : 'Start Review'}
                    </button>
                  )}
                  <button
                    onClick={() => handleAction('approve', aiReview.autoCorrections.length > 0)}
                    disabled={!!actionLoading}
                    className={`px-4 py-2 text-white rounded-lg text-sm font-medium ${actionColors.approve} disabled:opacity-50`}
                  >
                    <CheckCircle className="w-4 h-4 inline mr-1" />
                    {actionLoading === 'approve' ? 'Processing...' : 'Approve'}
                  </button>
                  <button
                    onClick={() => handleAction('request_revision')}
                    disabled={!!actionLoading}
                    className={`px-4 py-2 text-white rounded-lg text-sm font-medium ${actionColors.request_revision} disabled:opacity-50`}
                  >
                    {actionLoading === 'request_revision' ? 'Processing...' : 'Request Revision'}
                  </button>
                  <button
                    onClick={() => handleAction('reject')}
                    disabled={!!actionLoading}
                    className={`px-4 py-2 text-white rounded-lg text-sm font-medium ${actionColors.reject} disabled:opacity-50`}
                  >
                    <XCircle className="w-4 h-4 inline mr-1" />
                    {actionLoading === 'reject' ? 'Processing...' : 'Reject'}
                  </button>
                </div>
                  </>
                ) : null}
              </div>
            </div>
          )}

          {claim.status === 'approved' && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-emerald-600" />
              <div>
                <p className="font-medium text-emerald-800">Prior Authorization Approved</p>
                <p className="text-sm text-emerald-600">
                  {claim.auth_number && <>Auth #: {claim.auth_number} · </>}
                  {formatCurrency(claim.claim_amount)} approved on {formatDate(claim.reviewed_at)}
                </p>
              </div>
            </div>
          )}

          {claim.status === 'rejected' && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
              <XCircle className="w-6 h-6 text-red-600" />
              <div>
                <p className="font-medium text-red-800">Prior Authorization Denied</p>
                {claim.payer_notes && <p className="text-sm text-red-600 mt-0.5">{claim.payer_notes}</p>}
              </div>
            </div>
          )}

          <FhirPanel authorizationId={claim.id} />
        </div>

        <div>
          <div className="bg-white rounded-xl border border-slate-200 p-5 sticky top-6 mb-4">
            <h2 className="font-semibold text-slate-900 mb-4">Activity Timeline</h2>
            {events.length === 0 ? (
              <p className="text-sm text-slate-500">No activity yet</p>
            ) : (
              <div className="space-y-4">
                {events.map((event, i) => (
                  <div key={event.id} className="relative pl-6">
                    {i < events.length - 1 && (
                      <div className="absolute left-[7px] top-4 bottom-0 w-px bg-slate-200" />
                    )}
                    <div className="absolute left-0 top-1 w-3.5 h-3.5 rounded-full bg-brand-100 border-2 border-brand-500" />
                    <p className="text-sm font-medium text-slate-900 capitalize">{event.action.replace(/_/g, ' ')}</p>
                    {event.details && <p className="text-xs text-slate-600 mt-0.5">{event.details}</p>}
                    <p className="text-xs text-slate-400 mt-0.5">{formatDate(event.created_at)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
