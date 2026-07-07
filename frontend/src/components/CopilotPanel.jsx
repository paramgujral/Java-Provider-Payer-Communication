const SEVERITY_ICONS = { ERROR: '⛔', WARNING: '⚠️', INFO: '💡' }

function scoreColor(score) {
  if (score >= 80) return 'var(--good)'
  if (score >= 50) return 'var(--warning)'
  return 'var(--critical)'
}

/** Shows a copilot report: score, advisors, findings. */
export default function CopilotPanel({ report, running }) {
  if (running) {
    return (
      <div className="copilot">
        <div className="copilot-head">
          <span className="title">🤖 AI Copilot</span>
        </div>
        <div className="loading">Reviewing the request…</div>
      </div>
    )
  }
  if (!report) return null

  return (
    <div className="copilot">
      <div className="copilot-head">
        <div
          className="score-ring"
          style={{ '--score': report.readinessScore, '--score-color': scoreColor(report.readinessScore) }}
          title={`Readiness score ${report.readinessScore}/100`}
        >
          <span>{report.readinessScore}</span>
        </div>
        <div>
          <div className="title">🤖 AI Copilot review</div>
          <div className="advisors">
            {report.readyToSubmit ? 'Ready to submit' : 'Needs corrections before submission'} · advisors:{' '}
            {report.advisors?.join(', ')}
          </div>
        </div>
      </div>
      {report.findings?.length === 0 ? (
        <div className="copilot-empty">✓ No issues found — this request looks strong.</div>
      ) : (
        report.findings.map((f, i) => (
          <div className={`finding ${f.severity}`} key={i}>
            <span className="icon" aria-label={f.severity}>
              {SEVERITY_ICONS[f.severity] || '•'}
            </span>
            <div>
              <div className="field-name">{f.field}</div>
              <div className="msg">{f.message}</div>
              <div className="fix">{f.suggestion}</div>
              <div className="src">source: {f.source}</div>
            </div>
          </div>
        ))
      )}
    </div>
  )
}
