import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { providerApi } from '../api'
import CopilotPanel from '../components/CopilotPanel'

const EMPTY = {
  patientFirstName: '', patientLastName: '', patientDob: '', patientGender: '', memberId: '',
  payerName: 'Acme Health Insurance', insurancePlan: '',
  providerName: '', providerNpi: '',
  diagnosisCode: '', diagnosisDescription: '', procedureCode: '', procedureDescription: '',
  serviceDate: '', urgency: 'ROUTINE', clinicalJustification: '', requestedAmount: '',
}

export default function RequestForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState(EMPTY)
  const [savedId, setSavedId] = useState(id ? Number(id) : null)
  const [report, setReport] = useState(null)
  const [copilotRunning, setCopilotRunning] = useState(false)
  const [banner, setBanner] = useState(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (id) {
      providerApi.getRequest(id).then(({ request }) => {
        setForm({
          ...EMPTY,
          ...Object.fromEntries(Object.entries(request).filter(([k]) => k in EMPTY)),
          requestedAmount: request.requestedAmount ?? '',
        })
      })
    }
  }, [id])

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  const toDto = () => ({
    ...form,
    patientDob: form.patientDob || null,
    serviceDate: form.serviceDate || null,
    requestedAmount: form.requestedAmount === '' ? null : Number(form.requestedAmount),
  })

  /** Persists the draft (create or update) and returns its id. */
  const save = async () => {
    if (savedId) {
      await providerApi.updateRequest(savedId, toDto())
      return savedId
    }
    const created = await providerApi.createRequest(toDto())
    setSavedId(created.id)
    return created.id
  }

  const onSaveDraft = async () => {
    setBusy(true)
    setBanner(null)
    try {
      const rid = await save()
      setBanner({ kind: 'success', text: `Draft saved (${rid ? '#' + rid : ''}). You can come back to it anytime.` })
    } catch (e) {
      setBanner({ kind: 'error', text: e.message })
    } finally {
      setBusy(false)
    }
  }

  const onRunCopilot = async () => {
    setBusy(true)
    setBanner(null)
    setCopilotRunning(true)
    setReport(null)
    try {
      const rid = await save()
      setReport(await providerApi.runCopilot(rid))
    } catch (e) {
      setBanner({ kind: 'error', text: e.message })
    } finally {
      setCopilotRunning(false)
      setBusy(false)
    }
  }

  const onSubmit = async () => {
    setBusy(true)
    setBanner(null)
    try {
      const rid = await save()
      const submitted = await providerApi.submitRequest(rid)
      navigate(`/provider/requests/${rid}`, {
        state: { banner: `Submitted to payer — case ${submitted.payerCaseNumber}` },
      })
    } catch (e) {
      if (e.status === 422 && e.body?.copilotReport) {
        setReport(e.body.copilotReport)
        setBanner({ kind: 'error', text: 'The AI copilot blocked submission — fix the errors below and try again.' })
      } else {
        setBanner({ kind: 'error', text: e.message })
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h1>{id ? 'Edit authorization request' : 'New authorization request'}</h1>
          <div className="sub">The AI copilot reviews the request before it reaches the payer</div>
        </div>
      </div>

      {banner && <div className={`banner ${banner.kind}`}>{banner.text}</div>}

      <div className="grid cols-2">
        <div>
          <fieldset>
            <legend>Patient</legend>
            <div className="form-grid">
              <Field label="First name" value={form.patientFirstName} onChange={set('patientFirstName')} />
              <Field label="Last name" value={form.patientLastName} onChange={set('patientLastName')} />
              <Field label="Date of birth" type="date" value={form.patientDob} onChange={set('patientDob')} />
              <div className="field">
                <label>Gender</label>
                <select value={form.patientGender} onChange={set('patientGender')}>
                  <option value="">Select…</option>
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="other">Other</option>
                  <option value="unknown">Unknown</option>
                </select>
              </div>
              <Field label="Member ID" value={form.memberId} onChange={set('memberId')} placeholder="e.g. MBR12345678" />
              <Field label="Insurance plan" value={form.insurancePlan} onChange={set('insurancePlan')} placeholder="e.g. Gold PPO" />
            </div>
          </fieldset>

          <fieldset>
            <legend>Provider</legend>
            <div className="form-grid">
              <Field label="Provider / facility name" value={form.providerName} onChange={set('providerName')} />
              <Field label="NPI (10 digits)" value={form.providerNpi} onChange={set('providerNpi')} placeholder="e.g. 1234567893" />
              <Field label="Payer" value={form.payerName} onChange={set('payerName')} />
            </div>
          </fieldset>

          <fieldset>
            <legend>Clinical</legend>
            <div className="form-grid">
              <Field label="Diagnosis code (ICD-10)" value={form.diagnosisCode} onChange={set('diagnosisCode')} placeholder="e.g. M17.11" />
              <Field label="Diagnosis description" value={form.diagnosisDescription} onChange={set('diagnosisDescription')} />
              <Field label="Procedure code (CPT)" value={form.procedureCode} onChange={set('procedureCode')} placeholder="e.g. 27447" />
              <Field label="Procedure description" value={form.procedureDescription} onChange={set('procedureDescription')} />
              <Field label="Planned service date" type="date" value={form.serviceDate} onChange={set('serviceDate')} />
              <div className="field">
                <label>Urgency</label>
                <select value={form.urgency} onChange={set('urgency')}>
                  <option value="ROUTINE">Routine</option>
                  <option value="URGENT">Urgent</option>
                  <option value="EMERGENCY">Emergency</option>
                </select>
              </div>
              <div className="field wide">
                <label>Clinical justification (medical necessity)</label>
                <textarea
                  rows={4}
                  value={form.clinicalJustification}
                  onChange={set('clinicalJustification')}
                  placeholder="Symptoms, duration, failed conservative treatments, functional impact…"
                />
              </div>
            </div>
          </fieldset>

          <fieldset>
            <legend>Financial</legend>
            <div className="form-grid">
              <Field label="Requested amount (USD)" type="number" value={form.requestedAmount} onChange={set('requestedAmount')} placeholder="e.g. 32500" />
            </div>
          </fieldset>

          <div className="btn-row">
            <button className="btn" onClick={onSaveDraft} disabled={busy}>💾 Save draft</button>
            <button className="btn" onClick={onRunCopilot} disabled={busy}>🤖 Run AI copilot</button>
            <button className="btn primary" onClick={onSubmit} disabled={busy}>📤 Submit to payer</button>
          </div>
        </div>

        <div style={{ position: 'sticky', top: 76 }}>
          {report || copilotRunning ? (
            <CopilotPanel report={report} running={copilotRunning} />
          ) : (
            <div className="card" style={{ color: 'var(--ink-2)' }}>
              <h2 className="section-title">🤖 AI Copilot</h2>
              Fill in the form and run the copilot. It validates critical information (codes, identifiers,
              dates, amounts), checks that the diagnosis supports the procedure, and recommends corrections
              — before the payer ever sees the request.
            </div>
          )}
        </div>
      </div>
    </>
  )
}

function Field({ label, type = 'text', ...rest }) {
  return (
    <div className="field">
      <label>{label}</label>
      <input type={type} {...rest} />
    </div>
  )
}
