import { formatDateTime } from '../api'

/** Status history timeline. */
export default function Timeline({ events }) {
  if (!events || events.length === 0) return <div className="empty">No history yet</div>
  return (
    <ul className="timeline">
      {events.map((e) => (
        <li key={e.id}>
          <div className="when">{formatDateTime(e.occurredAt)}</div>
          <div className="what">
            {e.fromStatus ? `${prettify(e.fromStatus)} → ${prettify(e.toStatus)}` : prettify(e.toStatus)}
            <span style={{ color: 'var(--ink-muted)', fontWeight: 400 }}> · {e.actor}</span>
          </div>
          {e.note && <div className="note">{e.note}</div>}
        </li>
      ))}
    </ul>
  )
}

function prettify(status) {
  return status ? status.replaceAll('_', ' ').toLowerCase().replace(/^./, (c) => c.toUpperCase()) : ''
}
