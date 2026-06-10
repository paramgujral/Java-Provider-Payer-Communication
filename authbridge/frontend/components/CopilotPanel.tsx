"use client";

import type { CopilotReview } from "@/lib/types";
import { IconAlert, IconCheck, IconSparkle } from "./icons";
import { ScoreRing } from "./ScoreRing";

const SEVERITY_STYLE = {
  ERROR: { ring: "border-rose-200 bg-rose-50", dot: "text-rose-500", label: "Blocking" },
  WARNING: { ring: "border-amber-200 bg-amber-50", dot: "text-amber-500", label: "Warning" },
  INFO: { ring: "border-blue-200 bg-blue-50", dot: "text-blue-500", label: "Tip" },
} as const;

export function CopilotPanel({
  review,
  loading,
  onApplyNarrative,
}: {
  review?: CopilotReview;
  loading?: boolean;
  onApplyNarrative?: (text: string) => void;
}) {
  return (
    <div className="card overflow-hidden">
      <div className="flex items-center gap-2.5 border-b border-slate-100 bg-gradient-to-r from-brand-600 to-brand-700 px-4 py-3 text-white">
        <IconSparkle />
        <div>
          <p className="text-sm font-bold leading-tight">AuthBridge Copilot</p>
          <p className="text-[11px] text-brand-100">Pre-submission review</p>
        </div>
        {review && (
          <span className="ml-auto rounded-full bg-white/15 px-2 py-0.5 text-[11px] font-medium">
            {review.generatedBy === "llm" ? "Claude" : "Rules engine"}
          </span>
        )}
      </div>

      <div className="p-4">
        {loading && (
          <div className="flex items-center gap-2 py-8 text-sm text-slate-500">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-brand-200 border-t-brand-600" />
            Analyzing request…
          </div>
        )}

        {!loading && !review && (
          <p className="py-8 text-center text-sm text-slate-400">
            Fill in the request and the copilot will review it automatically.
          </p>
        )}

        {!loading && review && (
          <>
            <div className="flex items-center justify-around">
              <ScoreRing value={review.completenessScore} label="Completeness" />
              <ScoreRing value={review.approvalLikelihood} label="Approval likelihood" />
            </div>

            <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2.5 text-sm text-slate-600">{review.summary}</p>

            {review.issues.length > 0 ? (
              <ul className="mt-4 space-y-2">
                {review.issues.map((issue, i) => {
                  const s = SEVERITY_STYLE[issue.severity];
                  return (
                    <li key={i} className={`rounded-lg border px-3 py-2.5 ${s.ring}`}>
                      <div className="flex items-start gap-2">
                        <IconAlert className={`mt-0.5 shrink-0 ${s.dot}`} width={16} height={16} />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-800">{issue.title}</p>
                          <p className="text-xs text-slate-600">{issue.detail}</p>
                          {issue.suggestion && (
                            <p className="mt-1 text-xs font-medium text-slate-700">→ {issue.suggestion}</p>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="mt-4 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm font-medium text-emerald-700">
                <IconCheck width={16} height={16} />
                No issues found — this request is ready to submit.
              </div>
            )}

            {review.suggestedNarrative && onApplyNarrative && (
              <div className="mt-4 rounded-lg border border-brand-200 bg-brand-50 p-3">
                <p className="text-xs font-semibold text-brand-700">Suggested clinical narrative</p>
                <p className="mt-1 text-xs text-slate-600">{review.suggestedNarrative}</p>
                <button
                  onClick={() => onApplyNarrative(review.suggestedNarrative!)}
                  className="btn-secondary mt-2 px-3 py-1 text-xs"
                >
                  Use this draft
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
