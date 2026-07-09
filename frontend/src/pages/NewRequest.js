import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const initialForm = {
  patientName: '',
  patientDob: '',
  patientMemberId: '',
  providerNpi: '',
  payerOrgName: '',
  procedureCode: '',
  procedureDescription: '',
  diagnosisCode: '',
  diagnosisDescription: '',
  requestedServiceDate: '',
  clinicalNotes: '',
  unitsRequested: '',
};

export default function NewRequest() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [created, setCreated] = useState(null); // AuthorizationResponse after creation
  const [reviewing, setReviewing] = useState(false);
  const [review, setReview] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const payload = {
        ...form,
        unitsRequested: form.unitsRequested ? parseInt(form.unitsRequested, 10) : null,
      };
      const res = await api.post('/auth-requests', payload);
      setCreated(res.data);
      setReview({
        completenessScore: res.data.aiCompletenessScore,
        flaggedIssues: res.data.aiFlaggedIssues,
        summary: res.data.aiReviewSummary,
        issues: [],
        recommendations: [],
      });
      // fetch full review detail (issues/recommendations)
      const reviewRes = await api.post(`/auth-requests/${res.data.fhirId}/copilot-review`);
      setReview(reviewRes.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create request.');
    } finally {
      setSaving(false);
    }
  };

  const rerunReview = async () => {
    if (!created) return;
    setReviewing(true);
    try {
      const res = await api.post(`/auth-requests/${created.fhirId}/copilot-review`);
      setReview(res.data);
    } finally {
      setReviewing(false);
    }
  };

  const handleSubmitToPayer = async () => {
    if (!created) return;
    setSubmitting(true);
    setError('');
    try {
      await api.post(`/auth-requests/${created.fhirId}/submit`);
      navigate(`/requests/${created.fhirId}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>New Authorization Request</h1>
          <div className="subtitle">Complete the form below. The AI Copilot will review it for completeness before you submit to the payer.</div>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {!created ? (
        <form onSubmit={handleCreate} className="card">
          <h3>Patient Information</h3>
          <div className="form-grid">
            <div className="field">
              <label>Patient name</label>
              <input value={form.patientName} onChange={e => update('patientName', e.target.value)} required />
            </div>
            <div className="field">
              <label>Date of birth</label>
              <input type="date" value={form.patientDob} onChange={e => update('patientDob', e.target.value)} required />
            </div>
            <div className="field">
              <label>Insurance member ID</label>
              <input value={form.patientMemberId} onChange={e => update('patientMemberId', e.target.value)} required />
            </div>
            <div className="field">
              <label>Payer organization</label>
              <input value={form.payerOrgName} onChange={e => update('payerOrgName', e.target.value)} required
                     placeholder="Must match the payer's registered organization name" />
            </div>
          </div>

          <h3 style={{ marginTop: 20 }}>Provider Information</h3>
          <div className="form-grid">
            <div className="field">
              <label>Rendering provider NPI</label>
              <input value={form.providerNpi} onChange={e => update('providerNpi', e.target.value)} required
                     placeholder="10-digit NPI" maxLength={10} />
            </div>
          </div>

          <h3 style={{ marginTop: 20 }}>Service Details</h3>
          <div className="form-grid">
            <div className="field">
              <label>Procedure code (CPT/HCPCS)</label>
              <input value={form.procedureCode} onChange={e => update('procedureCode', e.target.value)} required placeholder="e.g. 99213" />
            </div>
            <div className="field">
              <label>Procedure description</label>
              <input value={form.procedureDescription} onChange={e => update('procedureDescription', e.target.value)} required />
            </div>
            <div className="field">
              <label>Diagnosis code (ICD-10)</label>
              <input value={form.diagnosisCode} onChange={e => update('diagnosisCode', e.target.value)} required placeholder="e.g. M54.5" />
            </div>
            <div className="field">
              <label>Diagnosis description</label>
              <input value={form.diagnosisDescription} onChange={e => update('diagnosisDescription', e.target.value)} required />
            </div>
            <div className="field">
              <label>Requested service date</label>
              <input type="date" value={form.requestedServiceDate} onChange={e => update('requestedServiceDate', e.target.value)} />
            </div>
            <div className="field">
              <label>Units / visits requested</label>
              <input type="number" min="1" value={form.unitsRequested} onChange={e => update('unitsRequested', e.target.value)} />
            </div>
            <div className="field full">
              <label>Clinical notes / medical necessity</label>
              <textarea value={form.clinicalNotes} onChange={e => update('clinicalNotes', e.target.value)}
                        placeholder="Describe diagnosis history, prior treatments, and why this service is needed." />
            </div>
          </div>

          <div style={{ marginTop: 20 }}>
            <button className="btn btn-primary" type="submit" disabled={saving}>
              {saving ? 'Creating & running AI review...' : 'Save Draft & Run AI Copilot Review'}
            </button>
          </div>
        </form>
      ) : (
        <>
          <div className="card">
            <h3>Draft Created: {created.fhirId}</h3>
            <p style={{ color: 'var(--color-ink-soft)', fontSize: 13.5 }}>
              {created.patientName} &middot; {created.procedureCode} {created.procedureDescription} &middot; to {created.payerOrgName}
            </p>
          </div>

          {review && (
            <div className="copilot-panel">
              <div className="score-row">
                <div className="score-badge">
                  {review.completenessScore}<span className="of"> / 100</span>
                </div>
                <div>
                  <strong>AI Copilot Completeness Score</strong>
                  <div style={{ fontSize: 13.5, color: 'var(--color-ink-soft)' }}>{review.summary}</div>
                </div>
              </div>

              {review.issues && review.issues.length > 0 && (
                <>
                  <div className="issues-title">Issues found</div>
                  <ul>
                    {review.issues.map((issue, i) => <li key={i}>{issue}</li>)}
                  </ul>
                </>
              )}

              {review.recommendations && review.recommendations.length > 0 && (
                <>
                  <div className="recs-title">Recommendations</div>
                  <ul>
                    {review.recommendations.map((rec, i) => <li key={i}>{rec}</li>)}
                  </ul>
                </>
              )}

              <div style={{ marginTop: 14 }}>
                <button className="btn btn-secondary btn-sm" onClick={rerunReview} disabled={reviewing}>
                  {reviewing ? 'Re-running...' : 'Re-run review'}
                </button>
              </div>
            </div>
          )}

          <div className="card" style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-primary" onClick={handleSubmitToPayer} disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit to Payer'}
            </button>
            <button className="btn btn-secondary" onClick={() => navigate(`/requests/${created.fhirId}`)}>
              View Full Details
            </button>
          </div>
        </>
      )}
    </div>
  );
}
