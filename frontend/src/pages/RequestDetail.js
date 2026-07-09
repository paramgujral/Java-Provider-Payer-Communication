import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import StatusPill from '../components/StatusPill';

const PAYER_STATUS_OPTIONS = ['IN_REVIEW', 'PENDED', 'APPROVED', 'PARTIAL', 'REJECTED'];

export default function RequestDetail() {
  const { fhirId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // Payer review form state
  const [newStatus, setNewStatus] = useState('IN_REVIEW');
  const [notes, setNotes] = useState('');
  const [approvedUnits, setApprovedUnits] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/auth-requests/${fhirId}`);
      setData(res.data);
      setNewStatus(res.data.status === 'SUBMITTED' ? 'IN_REVIEW' : res.data.status);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load request.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fhirId]);

  const isProvider = user?.role === 'PROVIDER';
  const isPayer = user?.role === 'PAYER';

  const canSubmit = isProvider && (data?.status === 'DRAFT' || data?.status === 'PENDED');
  const canCancel = isProvider && data && !['APPROVED', 'REJECTED', 'CANCELLED'].includes(data.status);
  const canReview = isPayer && data && ['SUBMITTED', 'IN_REVIEW', 'PENDED'].includes(data.status);

  const handleSubmit = async () => {
    setActionLoading(true);
    setError('');
    try {
      const res = await api.post(`/auth-requests/${fhirId}/submit`);
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Withdraw this authorization request?')) return;
    setActionLoading(true);
    setError('');
    try {
      const res = await api.post(`/auth-requests/${fhirId}/cancel`);
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to cancel.');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePayerUpdate = async () => {
    setActionLoading(true);
    setError('');
    try {
      const res = await api.put(`/auth-requests/${fhirId}/status`, {
        status: newStatus,
        payerResponseNotes: notes,
        approvedUnits: approvedUnits || null,
      });
      setData(res.data);
      setNotes('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update status.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className="empty-state">Loading...</div>;
  if (!data) return <div className="empty-state">{error || 'Request not found.'}</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>{data.fhirId}</h1>
          <div className="subtitle">
            {data.patientName} &middot; {data.procedureCode} {data.procedureDescription}
          </div>
        </div>
        <StatusPill status={data.status} />
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="detail-grid">
        <div>
          <div className="card">
            <h3>Request Details (FHIR Claim Resource)</h3>
            <div className="kv-grid">
              <div className="kv"><label>FHIR Resource ID</label><div className="value mono">Claim/{data.fhirId}</div></div>
              <div className="kv"><label>Status</label><div className="value"><StatusPill status={data.status} /></div></div>

              <div className="kv"><label>Patient Name</label><div className="value">{data.patientName}</div></div>
              <div className="kv"><label>Date of Birth</label><div className="value">{data.patientDob}</div></div>

              <div className="kv"><label>Member ID</label><div className="value mono">{data.patientMemberId}</div></div>
              <div className="kv"><label>Provider NPI</label><div className="value mono">{data.providerNpi}</div></div>

              <div className="kv"><label>Provider Organization</label><div className="value">{data.providerOrgName}</div></div>
              <div className="kv"><label>Payer Organization</label><div className="value">{data.payerOrgName}</div></div>

              <div className="kv"><label>Procedure Code</label><div className="value mono">{data.procedureCode}</div></div>
              <div className="kv"><label>Procedure Description</label><div className="value">{data.procedureDescription}</div></div>

              <div className="kv"><label>Diagnosis Code (ICD-10)</label><div className="value mono">{data.diagnosisCode}</div></div>
              <div className="kv"><label>Diagnosis Description</label><div className="value">{data.diagnosisDescription}</div></div>

              <div className="kv"><label>Requested Service Date</label><div className="value">{data.requestedServiceDate || '—'}</div></div>
              <div className="kv"><label>Units Requested</label><div className="value">{data.unitsRequested ?? '—'}</div></div>

              {data.approvedUnits && (
                <div className="kv"><label>Approved Units</label><div className="value">{data.approvedUnits}</div></div>
              )}
            </div>

            {data.clinicalNotes && (
              <div style={{ marginTop: 16 }}>
                <label style={{ fontSize: 11, textTransform: 'uppercase', color: 'var(--color-ink-soft)', letterSpacing: '0.04em' }}>Clinical Notes</label>
                <p style={{ marginTop: 4, fontSize: 14 }}>{data.clinicalNotes}</p>
              </div>
            )}

            {data.payerResponseNotes && (
              <div style={{ marginTop: 16, borderTop: '1px solid var(--color-border)', paddingTop: 12 }}>
                <label style={{ fontSize: 11, textTransform: 'uppercase', color: 'var(--color-ink-soft)', letterSpacing: '0.04em' }}>Payer Response Notes</label>
                <p style={{ marginTop: 4, fontSize: 14 }}>{data.payerResponseNotes}</p>
              </div>
            )}
          </div>

          {data.aiCompletenessScore != null && (
            <div className="copilot-panel">
              <div className="score-row">
                <div className="score-badge">
                  {data.aiCompletenessScore}<span className="of"> / 100</span>
                </div>
                <div>
                  <strong>AI Copilot Review</strong>
                  <div style={{ fontSize: 13.5, color: 'var(--color-ink-soft)' }}>{data.aiReviewSummary}</div>
                </div>
              </div>
            </div>
          )}

          {/* Provider actions */}
          {(canSubmit || canCancel) && (
            <div className="card" style={{ display: 'flex', gap: 10 }}>
              {canSubmit && (
                <button className="btn btn-primary" onClick={handleSubmit} disabled={actionLoading}>
                  {actionLoading ? 'Submitting...' : 'Submit to Payer'}
                </button>
              )}
              {canCancel && (
                <button className="btn btn-danger" onClick={handleCancel} disabled={actionLoading}>
                  Withdraw Request
                </button>
              )}
            </div>
          )}

          {/* Payer review actions */}
          {canReview && (
            <div className="card">
              <h3>Review &amp; Respond</h3>
              <div className="form-grid">
                <div className="field">
                  <label>New status</label>
                  <select value={newStatus} onChange={e => setNewStatus(e.target.value)}>
                    {PAYER_STATUS_OPTIONS.map(s => (
                      <option key={s} value={s}>{s.replace('_', ' ')}</option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label>Approved units (optional)</label>
                  <input value={approvedUnits} onChange={e => setApprovedUnits(e.target.value)} placeholder="e.g. 6 of 10 requested" />
                </div>
                <div className="field full">
                  <label>Response notes</label>
                  <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Explain the determination, request additional info, etc." />
                </div>
              </div>
              <div style={{ marginTop: 14 }}>
                <button className="btn btn-primary" onClick={handlePayerUpdate} disabled={actionLoading}>
                  {actionLoading ? 'Updating...' : 'Submit Determination'}
                </button>
              </div>
            </div>
          )}
        </div>

        <div>
          <div className="card">
            <h3>Status History</h3>
            {data.history.length === 0 ? (
              <p style={{ fontSize: 13.5, color: 'var(--color-ink-soft)' }}>No status changes yet.</p>
            ) : (
              data.history.map((h, i) => (
                <div className="history-item" key={i}>
                  <div>
                    <StatusPill status={h.previousStatus} /> &rarr; <StatusPill status={h.newStatus} />
                  </div>
                  {h.note && <div style={{ marginTop: 4 }}>{h.note}</div>}
                  <div className="meta">{h.changedByUsername} &middot; {new Date(h.changedAt).toLocaleString()}</div>
                </div>
              ))
            )}
          </div>

          <div className="card">
            <h3>Timeline</h3>
            <div className="kv-grid" style={{ gridTemplateColumns: '1fr' }}>
              <div className="kv"><label>Created</label><div className="value">{new Date(data.createdAt).toLocaleString()}</div></div>
              <div className="kv"><label>Last Updated</label><div className="value">{new Date(data.updatedAt).toLocaleString()}</div></div>
            </div>
          </div>

          <button className="btn btn-secondary" onClick={() => navigate('/')}>&larr; Back to Dashboard</button>
        </div>
      </div>
    </div>
  );
}
