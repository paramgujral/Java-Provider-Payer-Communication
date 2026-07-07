import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { formatDateTime, formatMoney, payerApi } from '../api'
import StatusChip from '../components/StatusChip'
import Timeline from '../components/Timeline'

export default function CaseDetail() {
  const { id } = useParams()
  const [detail, setDetail] = useState(null)
  const [note, setNote] = useState('')
  const [banner, setBanner] = useState(null)
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    try {
      setDetail(await payerApi.getCase(id))
    } catch {
      /* retry on next poll */
    }
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  if (!detail) return <div className="loading">Loading case…</div>
  const c = detail.authCase

  const decide = async (action) => {
    setBusy(true)
    setBanner(null)
    try {
      await payerApi.decide(c.id, action, note)
      setNote('')
      setBanner({ kind: 'success', text: `Decision recorded — the provider has been notified over FHIR.` })
      load()
    } catch (e) {
      setBanner({ kind: 'error', text: e.message })
    } finally {
      setBusy(false)
    }
  }

  let fhirPretty = c.rawBundleJson
  try {
    fhirPretty = JSON.stringify(JSON.parse(c.rawBundleJson), null, 2)
  } catch {
    /* keep as-is */
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h1>
            {c.caseNumber} <StatusChip status={c.status} />
          </h1>
          <div className="sub">
            {c.requestNumber} from {c.providerName} · received {formatDateTime(c.receivedAt)}
            {c.resubmissionCount > 0 && <> · resubmission #{c.resubmissionCount}</>}
          </div>
        </div>
        <div>
          {(c.reviewFlags || '')
            .split(',')
            .filter(Boolean)
            .map((f) => (
              <span className="flag" key={f}>{f.replaceAll('_', ' ')}</span>
            ))}
        </div>
      </div>

      {banner && <div className={`banner ${banner.kind}`}>{banner.text}</div>}

      <div className="grid cols-2">
        <div>
          <div className="card">
            <h2 className="section-title">Clinical review</h2>
            <dl className="kv">
              <dt>Patient</dt><dd>{c.patientFirstName} {c.patientLastName} ({c.patientGender || '—'}), born {c.patientDob || '—'}</dd>
              <dt>Member ID</dt><dd>{c.memberId || '—'} {c.insurancePlan ? `· ${c.insurancePlan}` : ''}</dd>
              <dt>Provider</dt><dd>{c.providerName} (NPI {c.providerNpi || '—'})</dd>
              <dt>Diagnosis</dt><dd>{c.diagnosisCode} — {c.diagnosisDescription || '—'}</dd>
              <dt>Procedure</dt><dd>{c.procedureCode} — {c.procedureDescription || '—'}</dd>
              <dt>Service date</dt><dd>{c.serviceDate || '—'} ({(c.urgency || 'ROUTINE').toLowerCase()})</dd>
              <dt>Requested amount</dt><dd>{formatMoney(c.requestedAmount)}</dd>
              <dt>Clinical justification</dt><dd>{c.clinicalJustification || '—'}</dd>
              {c.decisionNote && (<><dt>Decision note</dt><dd>{c.decisionNote}</dd></>)}
            </dl>

            {c.status === 'PENDING_REVIEW' && (
              <div style={{ marginTop: 16, borderTop: '1px solid var(--grid)', paddingTop: 14 }}>
                <div className="field" style={{ marginBottom: 10 }}>
                  <label>Decision note (required for reject / request info — sent back to the provider)</label>
                  <textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)}
                    placeholder="e.g. Please attach recent imaging results" />
                </div>
                <div className="btn-row">
                  <button className="btn good" disabled={busy} onClick={() => decide('APPROVE')}>✓ Approve</button>
                  <button className="btn warn" disabled={busy} onClick={() => decide('REQUEST_INFO')}>❗ Request info</button>
                  <button className="btn danger" disabled={busy} onClick={() => decide('REJECT')}>✕ Reject</button>
                </div>
              </div>
            )}
          </div>

          <details className="fhir">
            <summary>View original FHIR Claim bundle (as received on the wire)</summary>
            <pre>{fhirPretty}</pre>
          </details>
        </div>
        <div className="card">
          <h2 className="section-title">Case timeline</h2>
          <Timeline events={detail.history} />
        </div>
      </div>
    </>
  )
}
