import type { DashboardStats } from '../types';

const STATUS_ITEMS = [
  { key: 'submitted' as const, label: 'Submitted', color: 'bg-blue-500' },
  { key: 'under_review' as const, label: 'Under Review', color: 'bg-amber-500' },
  { key: 'approved' as const, label: 'Approved', color: 'bg-emerald-500' },
  { key: 'rejected' as const, label: 'Rejected', color: 'bg-red-500' },
  { key: 'revision_requested' as const, label: 'Revision', color: 'bg-orange-500' },
  { key: 'draft' as const, label: 'Draft', color: 'bg-slate-400' },
];

export function StatusChart({ stats, showDraft = true }: { stats: DashboardStats; showDraft?: boolean }) {
  const items = showDraft ? STATUS_ITEMS : STATUS_ITEMS.filter((i) => i.key !== 'draft');
  const max = Math.max(...items.map((i) => stats[i.key]), 1);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <h2 className="font-semibold text-slate-900 mb-4">Claims by Status</h2>
      <div className="space-y-3">
        {items.map(({ key, label, color }) => {
          const count = stats[key];
          const width = count > 0 ? Math.max(8, (count / max) * 100) : 0;
          return (
            <div key={key}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-600">{label}</span>
                <span className="font-medium text-slate-900">{count}</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                {count > 0 && (
                  <div className={`h-full rounded-full ${color} transition-all duration-500`} style={{ width: `${width}%` }} />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
