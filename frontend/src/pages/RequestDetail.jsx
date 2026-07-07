import { useCallback, useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { formatDateTime, formatMoney, providerApi } from '../api'
import StatusChip from '../components/StatusChip'
import Timeline from '../components/Timeline'
import CopilotPanel from '../components/CopilotPanel'

export default function RequestDetail() {
  const { id } = useParams()
  const location = useLocation()
  const [detail, setDetail] = useState(null)
  const [report, setReport] = useState(null)
  const [copilotRunning, setCopilotRunning] = useState(false)
  const [banner, setBanner] = useState(location.state?.banner ? { kind: 'success', text: location.state.banner } : null)

  const load = useCallback(async () => {
    try {
      setDetail(await providerApi.getRequest(id))
    } catch {
      /* retry on next poll */
    }
  }, [id])

  useEffect(() => {
    load()
    const timer = setInterval(load, 5000)
    return () => clearInterval(timer)
  }, [load])

  if (!detail) return <div className="loading">Loading request…</div>
  const r = detail.request

  const runCopilot = async () => {
    setCopilotRunning(true)
    setReport(null)
    try {
      setReport(await providerApi.runCopilot(r.id))
    } catch (e) {
      setBanner({ kind: 'error', text: e.message })
    } finally {
      setCopilotRunning(false)
    }
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h1>
            {r.requestNumber} <StatusChip status={r.status} />
          </h1>
          <div className="sub">
            {r.patientFirstName} {r.patientLastName} · {r.procedureDescription || r.procedureCode}
            {r.payerCaseNumber && <> · payer case <strong>{r.payerCaseNumber}</strong></>}
          </div>
        </div>
        <div className="btn-row">
          {(r.status === 'DRAFT' || r.status === 'INFO_REQUESTED') && (
            <>
              <Link to={`/provider/requests/${r.id}/edit`} className="btn">✏️ Edit</Link>
              <button className="btn" onClick={runCopilot}>🤖 Run copilot</button>
              <button
                className="btn primary"
                onClick={async () => {
                  try {
                    const s = await providerApi.submitRequest(r.id)
                    setBanner({ kind: 'success', text: `Submitted — payer case ${s.payerCaseNumber}` })
                    load()
                  } catch (e) {
                    if (e.status === 422 && e.body?.copilotReport) {
                      setReport(e.body.copilotReport)
                      setBanner({ kind: 'error', text: 'The AI copilot blocked submission — see its findings.' })
                    } else {
                      setBanner({ kind: 'error', text: e.message })
                    }
                  }
                }}
              >
                📤 {r.status === 'INFO_REQUESTED' ? 'Resubmit to payer' : 'Submit to payer'}
              </button>
            </>
          )}
        </div>
      </div>

      {banner && <div className={`banner ${banner.kind}`}>{banner.text}</div>}
      {r.status === 'INFO_REQUESTED' && r.payerNote && (
        <div className="banner info">
          ❗ The payer requested more information: <strong>{r.payerNote}</strong> — edit the request and resubmit.
        </div>
      )}

      <div className="grid cols-2">
        <div className="card">
          <h2 className="section-title">Request details</h2>
          <dl className="kv">
            <dt>Patient</dt><dd>{r.patientFirstName} {r.patientLastName} ({r.patientGender || '—'}), born {r.patientDob || '—'}</dd>
            <dt>Member ID</dt><dd>{r.memberId || '—'}</dd>
            <dt>Insurance</dt><dd>{r.payerName} {r.insurancePlan ? `· ${r.insurancePlan}` : ''}</dd>
            <dt>Provider</dt><dd>{r.providerName || '—'} (NPI {r.providerNpi || '—'})</dd>
            <dt>Diagnosis</dt><dd>{r.diagnosisCode || '—'} — {r.diagnosisDescription || '—'}</dd>
            <dt>Procedure</dt><dd>{r.procedureCode || '—'} — {r.procedureDescription || '—'}</dd>
            <dt>Service date</dt><dd>{r.serviceDate || '—'} ({(r.urgency || 'ROUTINE').toLowerCase()})</dd>
            <dt>Requested amount</dt><dd>{formatMoney(r.requestedAmount)}</dd>
            <dt>Clinical justification</dt><dd>{r.clinicalJustification || '—'}</dd>
            <dt>Submitted</dt><dd>{formatDateTime(r.submittedAt)}</dd>
            <dt>Decided</dt><dd>{formatDateTime(r.decidedAt)}</dd>
            {r.payerNote && (<><dt>Payer note</dt><dd>{r.payerNote}</dd></>)}
          </dl>
          {(report || copilotRunning) && (
            <div style={{ marginTop: 14 }}>
              <CopilotPanel report={report} running={copilotRunning} />
            </div>
          )}
        </div>
        <div className="card">
          <h2 className="section-title">Status timeline</h2>
          <Timeline events={detail.history} />
        </div>
      </div>
    </>
  )
}
