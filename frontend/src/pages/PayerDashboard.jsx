import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { formatMoney, payerApi } from '../api'
import StatTile from '../components/StatTile'
import StatusBars from '../components/StatusBars'
import StatusChip from '../components/StatusChip'

const FILTERS = ['ALL', 'PENDING_REVIEW', 'INFO_REQUESTED', 'APPROVED', 'REJECTED']

export default function PayerDashboard() {
  const [stats, setStats] = useState(null)
  const [cases, setCases] = useState(null)
  const [filter, setFilter] = useState('ALL')
  const navigate = useNavigate()

  useEffect(() => {
    const load = async () => {
      try {
        const [s, c] = await Promise.all([
          payerApi.stats(),
          payerApi.listCases(filter === 'ALL' ? null : filter),
        ])
        setStats(s)
        setCases(c)
      } catch {
        /* payer service still starting */
      }
    }
    load()
    const timer = setInterval(load, 5000)
    return () => clearInterval(timer)
  }, [filter])

  if (!stats || !cases) return <div className="loading">Connecting to payer service…</div>

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Payer review queue</h1>
          <div className="sub">Incoming prior-authorization requests (FHIR Claim/$submit)</div>
        </div>
      </div>

      <div className="grid cols-4" style={{ marginBottom: 14 }}>
        <StatTile label="Total cases" value={stats.total} />
        <StatTile label="Pending review" value={stats.pendingReview} hint="awaiting a decision" />
        <StatTile label="Approved" value={stats.byStatus?.APPROVED || 0} hint={`${formatMoney(stats.approvedAmount)} authorized`} />
        <StatTile label="Rejected" value={stats.byStatus?.REJECTED || 0} hint={`${formatMoney(stats.rejectedAmount)} declined`} />
      </div>

      <div className="grid cols-2">
        <div>
          <div className="btn-row" style={{ marginBottom: 10 }}>
            {FILTERS.map((f) => (
              <button
                key={f}
                className={`btn ${filter === f ? 'primary' : ''}`}
                style={{ padding: '4px 12px', fontSize: 12.5 }}
                onClick={() => setFilter(f)}
              >
                {f === 'ALL' ? 'All' : f.replaceAll('_', ' ').toLowerCase()}
              </button>
            ))}
          </div>
          {cases.length === 0 ? (
            <div className="card empty">No cases match this filter</div>
          ) : (
            <table className="list">
              <thead>
                <tr>
                  <th>Case</th>
                  <th>Patient</th>
                  <th>Procedure</th>
                  <th>Flags</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {cases.map((c) => (
                  <tr key={c.id} onClick={() => navigate(`/payer/cases/${c.id}`)}>
                    <td>
                      <strong>{c.caseNumber}</strong>
                      <div style={{ color: 'var(--ink-muted)', fontSize: 11.5 }}>{c.requestNumber}</div>
                    </td>
                    <td>
                      {c.patientFirstName} {c.patientLastName}
                    </td>
                    <td>
                      {c.procedureCode}
                      <span style={{ color: 'var(--ink-muted)' }}> · {c.procedureDescription || '—'}</span>
                    </td>
                    <td>
                      {(c.reviewFlags || '')
                        .split(',')
                        .filter(Boolean)
                        .map((f) => (
                          <span className="flag" key={f}>{f.replaceAll('_', ' ')}</span>
                        ))}
                    </td>
                    <td>
                      <StatusChip status={c.status} />
                    </td>
                    <td className="num">{formatMoney(c.requestedAmount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div className="card">
          <h2 className="section-title">Cases by status</h2>
          <StatusBars byStatus={stats.byStatus} />
        </div>
      </div>
    </>
  )
}
