import type { TimelineEvent } from "@/lib/types";
import { formatDate } from "@/lib/ui";

const ROLE_DOT: Record<string, string> = {
  PROVIDER: "bg-brand-500",
  PAYER: "bg-violet-500",
  COPILOT: "bg-emerald-500",
  SYSTEM: "bg-slate-400",
};

export function Timeline({ events }: { events: TimelineEvent[] }) {
  const ordered = [...events].sort((a, b) => a.at.localeCompare(b.at));
  return (
    <ol className="relative space-y-5 pl-2">
      {ordered.map((e, i) => (
        <li key={e.id} className="relative pl-6">
          {i < ordered.length - 1 && (
            <span className="absolute left-[7px] top-4 h-full w-px bg-slate-200" />
          )}
          <span
            className={`absolute left-0 top-1 h-3.5 w-3.5 rounded-full ring-4 ring-white ${
              ROLE_DOT[e.role] ?? "bg-slate-400"
            }`}
          />
          <div className="flex flex-wrap items-baseline justify-between gap-x-2">
            <p className="text-sm font-semibold text-slate-800">{e.action}</p>
            <span className="text-xs text-slate-400">{formatDate(e.at)}</span>
          </div>
          <p className="text-xs text-slate-500">{e.actor}</p>
          {e.note && <p className="mt-1 text-xs text-slate-600">{e.note}</p>}
        </li>
      ))}
    </ol>
  );
}
