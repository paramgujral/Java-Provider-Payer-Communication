export function Logo({ className = "", mark = false }: { className?: string; mark?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-sm">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 12h4l2-5 4 10 2-5h4" />
        </svg>
      </span>
      {!mark && (
        <span className="text-lg font-bold tracking-tight text-navy-900">
          Auth<span className="text-brand-600">Bridge</span>
        </span>
      )}
    </span>
  );
}
