import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, Send } from 'lucide-react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { AICopilotPanel } from '../components/AICopilotPanel';
import type { ClaimFormData, User } from '../types';

const EMPTY_FORM: ClaimFormData = {
  patient_name: '',
  patient_id: '',
  patient_dob: '',
  patient_gender: '',
  insurance_policy_number: '',
  diagnosis_code: '',
  diagnosis_description: '',
  procedure_code: '',
  procedure_description: '',
  claim_amount: 0,
  service_date: '',
  provider_notes: '',
  payer_id: '',
};

export function ClaimFormPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState<ClaimFormData>(EMPTY_FORM);
  const [payers, setPayers] = useState<User[]>([]);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [claimId, setClaimId] = useState(id || '');

  useEffect(() => {
    api.getUsers('payer').then(setPayers);
  }, []);

  useEffect(() => {
    if (id) {
      api.getClaim(id).then((claim) => {
        setForm({
          patient_name: claim.patient_name,
          patient_id: claim.patient_id,
          patient_dob: claim.patient_dob,
          patient_gender: claim.patient_gender,
          insurance_policy_number: claim.insurance_policy_number,
          diagnosis_code: claim.diagnosis_code,
          diagnosis_description: claim.diagnosis_description,
          procedure_code: claim.procedure_code,
          procedure_description: claim.procedure_description,
          claim_amount: claim.claim_amount,
          service_date: claim.service_date,
          provider_notes: claim.provider_notes,
          payer_id: claim.payer_id || '',
        });
      });
    }
  }, [id]);

  const updateField = (field: string, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const applyRecommendation = (field: string, value: string) => {
    if (field === 'claim_amount') {
      updateField(field, parseFloat(value) || 0);
    } else {
      updateField(field, value);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setError('');
    try {
      if (isEdit && claimId) {
        await api.updateClaim(claimId, user.id, form);
      } else {
        const claim = await api.createClaim(user.id, form);
        setClaimId(claim.id);
        navigate(`/provider/claims/${claim.id}/edit`, { replace: true });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!user) return;
    setSubmitting(true);
    setError('');
    try {
      let cId = claimId;
      if (!cId) {
        const claim = await api.createClaim(user.id, form);
        cId = claim.id;
        setClaimId(cId);
      } else {
        await api.updateClaim(cId, user.id, form);
      }
      const validation = await api.validateClaim(form);
      if (!validation.valid) {
        setError('Please fix all validation errors before submitting');
        setSubmitting(false);
        return;
      }
      if (!form.payer_id) {
        setError('Please select an insurance payer');
        setSubmitting(false);
        return;
      }
      await api.submitClaim(cId, user.id);
      navigate(`/provider/claims/${cId}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Submit failed');
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    'w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm';

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">{isEdit ? 'Edit Authorization Request' : 'New Prior Authorization Request'}</h1>
        <p className="text-slate-500 mt-1">FHIR Claim (use: preauthorization) — AI co-pilot validates before submission</p>
      </div>

      {error && <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="font-semibold text-slate-900 mb-4">Patient Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name *</label>
                <input className={inputClass} value={form.patient_name} onChange={(e) => updateField('patient_name', e.target.value)} placeholder="John Smith" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Patient ID *</label>
                <input className={inputClass} value={form.patient_id} onChange={(e) => updateField('patient_id', e.target.value)} placeholder="PAT-12345" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Date of Birth *</label>
                <input type="date" className={inputClass} value={form.patient_dob} onChange={(e) => updateField('patient_dob', e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Gender *</label>
                <select className={inputClass} value={form.patient_gender} onChange={(e) => updateField('patient_gender', e.target.value)}>
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Insurance Policy Number *</label>
                <input className={inputClass} value={form.insurance_policy_number} onChange={(e) => updateField('insurance_policy_number', e.target.value)} placeholder="HG-12345678" />
              </div>
            </div>
          </section>

          <section className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="font-semibold text-slate-900 mb-4">Diagnosis & Procedure</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">ICD-10 Diagnosis Code *</label>
                <input className={inputClass} value={form.diagnosis_code} onChange={(e) => updateField('diagnosis_code', e.target.value)} placeholder="E11.9" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">CPT Procedure Code *</label>
                <input className={inputClass} value={form.procedure_code} onChange={(e) => updateField('procedure_code', e.target.value)} placeholder="99213" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Diagnosis Description *</label>
                <input className={inputClass} value={form.diagnosis_description} onChange={(e) => updateField('diagnosis_description', e.target.value)} placeholder="Type 2 diabetes mellitus" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Procedure Description *</label>
                <input className={inputClass} value={form.procedure_description} onChange={(e) => updateField('procedure_description', e.target.value)} placeholder="Office visit, established patient" />
              </div>
            </div>
          </section>

          <section className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="font-semibold text-slate-900 mb-4">Claim Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Claim Amount ($) *</label>
                <input type="number" min="0" step="0.01" className={inputClass} value={form.claim_amount || ''} onChange={(e) => updateField('claim_amount', parseFloat(e.target.value) || 0)} placeholder="250.00" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Service Date *</label>
                <input type="date" className={inputClass} value={form.service_date} onChange={(e) => updateField('service_date', e.target.value)} />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Insurance Payer *</label>
                <select className={inputClass} value={form.payer_id || ''} onChange={(e) => updateField('payer_id', e.target.value)}>
                  <option value="">Select insurance company</option>
                  {payers.map((p) => (
                    <option key={p.id} value={p.id}>{p.organization}</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Clinical Notes</label>
                <textarea
                  className={`${inputClass} h-24 resize-none`}
                  value={form.provider_notes}
                  onChange={(e) => updateField('provider_notes', e.target.value)}
                  placeholder="Describe the treatment provided, medications prescribed, follow-up plan..."
                />
              </div>
            </div>
          </section>

          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium text-sm disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Draft'}
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium text-sm disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              {submitting ? 'Submitting...' : 'Submit to Payer'}
            </button>
          </div>
        </div>

        <div>
          <AICopilotPanel formData={form} onApplyRecommendation={applyRecommendation} />
        </div>
      </div>
    </div>
  );
}
