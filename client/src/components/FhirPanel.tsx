import { useEffect, useState } from 'react';
import { Code2, ExternalLink } from 'lucide-react';
import { api } from '../api';

export function FhirPanel({ authorizationId }: { authorizationId: string }) {
  const [bundle, setBundle] = useState<Record<string, unknown> | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || bundle) return;
    setLoading(true);
    api
      .getFhirBundle(authorizationId)
      .then(setBundle)
      .catch(() => setBundle(null))
      .finally(() => setLoading(false));
  }, [open, authorizationId, bundle]);

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-3 bg-slate-50 hover:bg-slate-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Code2 className="w-4 h-4 text-violet-600" />
          <span className="font-semibold text-slate-900 text-sm">FHIR R4 Resources</span>
          <span className="text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full">Patient · Coverage · Claim · ClaimResponse</span>
        </div>
        <span className="text-xs text-slate-500">{open ? 'Hide' : 'Show'}</span>
      </button>

      {open && (
        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-slate-500">
              Da Vinci PAS-aligned prior authorization bundle (use: preauthorization)
            </p>
            <a
              href={`/fhir/Claim/${authorizationId}`}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-brand-600 hover:text-brand-700 flex items-center gap-1"
            >
              FHIR API <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          {loading && <p className="text-sm text-slate-500">Loading FHIR bundle...</p>}
          {!loading && bundle && (
            <pre className="text-xs bg-slate-900 text-emerald-300 p-4 rounded-lg overflow-auto max-h-96">
              {JSON.stringify(bundle, null, 2)}
            </pre>
          )}
          {!loading && !bundle && <p className="text-sm text-red-600">Could not load FHIR bundle</p>}
        </div>
      )}
    </div>
  );
}
