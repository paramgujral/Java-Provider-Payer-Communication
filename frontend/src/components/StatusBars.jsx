const ORDER = ['DRAFT', 'SUBMITTED', 'PENDING_REVIEW', 'INFO_REQUESTED', 'APPROVED', 'REJECTED']

const LABELS = {
  DRAFT: 'Draft',
  SUBMITTED: 'Submitted',
  PENDING_REVIEW: 'Pending review',
  INFO_REQUESTED: 'Info requested',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
}

const COLORS = {
  DRAFT: '#c3c2b7',
  SUBMITTED: '#86b6ef',
  PENDING_REVIEW: '#2a78d6',
  INFO_REQUESTED: '#ec835a',
  APPROVED: '#0ca30c',
  REJECTED: '#d03b3b',
}

/** Horizontal bars showing counts per status. */
export default function StatusBars({ byStatus }) {
  const entries = ORDER.filter((s) => byStatus?.[s]).map((s) => [s, byStatus[s]])
  if (entries.length === 0) return <div className="empty">No requests yet</div>
  const max = Math.max(...entries.map(([, v]) => v))

  return (
    <div className="dist" role="img" aria-label="Requests by status">
      {entries.map(([status, count]) => (
        <div className="dist-row" key={status}>
          <span className="name">{LABELS[status]}</span>
          <span className="track">
            <span
              className="bar"
              style={{ width: `${(count / max) * 100}%`, background: COLORS[status] }}
            />
          </span>
          <span className="count">{count}</span>
        </div>
      ))}
    </div>
  )
}
