import React from 'react';

const LABELS = {
  DRAFT: 'Draft',
  SUBMITTED: 'Submitted',
  IN_REVIEW: 'In Review',
  PENDED: 'Pended',
  APPROVED: 'Approved',
  PARTIAL: 'Partially Approved',
  REJECTED: 'Rejected',
  CANCELLED: 'Cancelled',
};

export default function StatusPill({ status }) {
  return (
    <span className={`status-pill status-${status}`}>
      {LABELS[status] || status}
    </span>
  );
}
