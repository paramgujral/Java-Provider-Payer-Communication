import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { formatMoney, providerApi } from '../api'
import StatTile from '../components/StatTile'
import StatusBars from '../components/StatusBars'
import StatusChip from '../components/StatusChip'

const FILTERS = ['ALL', 'DRAFT', 'PENDING_REVIEW', 'INFO_REQUESTED', 'APPROVED', 'REJECTED']

export default function ProviderDashboard() {
  const [stats, setStats] = useState(null)
  const [requests, setRequests] = useState(null)
  const [filter, setFilter] = useState('ALL')
  const navigate = useNavigate()

  useEffect(() => {
    const load = async () => {
      try {
        const [s, r] = await Promise.all([
          providerApi.stats(),
          providerApi.listRequests(filter === 'ALL' ? null : filter),
        ])
        setStats(s)
        setRequests(r)
      } catch {
        /* provider service still starting */
      }
    }
    load()
    const timer = setInterval(load, 5000)
    return () => clearInterval(timer)
  }, [filter])

  if (!stats || !requests) return <div className="loading">Connecting to provider service…</div>

  const by = stats.byStatus || {}
  const open = (by.SUBMITTED || 0) + (by.PENDING_REVIEW || 0)

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Provider dashboard</h1>
          <div className="sub">Prior-authorization requests sent to Acme Health Insurance</div>
        </div>
        <Link to="/provider/new" className="btn primary">＋ New authorization request</Link>
      </div>

      <div className="grid cols-4" style={{ marginBottom: 14 }}>
        <StatTile label="Total requests" value={stats.total} />
        <StatTile label="Awaiting payer" value={open} hint="submitted or in review" />
        <StatTile
          label="Approved"
          value={by.APPROVED || 0}
          hint={`${formatMoney(stats.approvedAmount)} authorized`}
        />
        <StatTile label="Needs attention" value={(by.INFO_REQUESTED || 0) + (by.DRAFT || 0)} hint="drafts + info requests" />
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
          {requests.length === 0 ? (
            <div className="card empty">No requests match this filter</div>
          ) : (
            <table className="list">
              <thead>
                <tr>
                  <th>Request</th>
                  <th>Patient</th>
                  <th>Procedure</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((r) => (
                  <tr key={r.id} onClick={() => navigate(`/provider/requests/${r.id}`)}>
                    <td>
                      <strong>{r.requestNumber}</strong>
                    </td>
                    <td>
                      {r.patientFirstName} {r.patientLastName}
                    </td>
                    <td>
                      {r.procedureCode}
                      <span style={{ color: 'var(--ink-muted)' }}> · {r.procedureDescription || '—'}</span>
                    </td>
                    <td>
                      <StatusChip status={r.status} />
                    </td>
                    <td className="num">{formatMoney(r.requestedAmount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div className="card">
          <h2 className="section-title">Requests by status</h2>
          <StatusBars byStatus={by} />
        </div>
      </div>
    </>
  )
}
