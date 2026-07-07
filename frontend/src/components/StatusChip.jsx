const STATUS_META = {
  DRAFT: { cls: 'draft', icon: '✏️', label: 'Draft' },
  SUBMITTED: { cls: 'submitted', icon: '📤', label: 'Submitted' },
  PENDING_REVIEW: { cls: 'pending', icon: '⏳', label: 'Pending review' },
  INFO_REQUESTED: { cls: 'info-requested', icon: '❗', label: 'Info requested' },
  APPROVED: { cls: 'approved', icon: '✓', label: 'Approved' },
  REJECTED: { cls: 'rejected', icon: '✕', label: 'Rejected' },
}

/** Status chip: icon + label. */
export default function StatusChip({ status }) {
  const meta = STATUS_META[status] || { cls: 'draft', icon: '•', label: status }
  return (
    <span className={`chip ${meta.cls}`}>
      <span aria-hidden="true">{meta.icon}</span>
      {meta.label}
    </span>
  )
}
