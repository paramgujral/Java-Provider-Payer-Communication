import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle } from 'lucide-react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { StatusBadge, formatCurrency, formatDate } from '../components/ui';
import type { Claim } from '../types';

export function ClaimsListPage() {
  const { user } = useAuth();
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const isProvider = user?.role === 'provider';

  useEffect(() => {
    if (!user) return;
    const fetch = isProvider ? api.getProviderClaims : api.getPayerClaims;
    fetch(user.id)
      .then(setClaims)
      .finally(() => setLoading(false));
  }, [user?.id, isProvider]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-3 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {isProvider ? 'My Authorizations' : 'Authorization Queue'}
          </h1>
          <p className="text-slate-500 mt-1">
            {isProvider ? 'Manage prior authorization requests and track payer responses' : 'Review and respond to incoming prior auth requests'}
          </p>
        </div>
        {isProvider && (
          <Link
            to="/provider/claims/new"
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium text-sm"
          >
            <PlusCircle className="w-4 h-4" />
            New Auth Request
          </Link>
        )}
      </div>

      {claims.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <p className="text-slate-500">No claims found</p>
          {isProvider && (
            <Link to="/provider/claims/new" className="inline-block mt-4 text-brand-600 hover:text-brand-700 font-medium">
              Create your first claim →
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                <th className="px-5 py-3">Patient</th>
                <th className="px-5 py-3">Diagnosis</th>
                <th className="px-5 py-3">Amount</th>
                <th className="px-5 py-3">AI Score</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {claims.map((claim) => (
                <tr key={claim.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3">
                    <Link to={`/${user!.role}/claims/${claim.id}`} className="font-medium text-brand-600 hover:text-brand-700">
                      {claim.patient_name || '—'}
                    </Link>
                    <p className="text-xs text-slate-400">{claim.patient_id}</p>
                  </td>
                  <td className="px-5 py-3 text-sm text-slate-600 max-w-[200px] truncate">
                    {claim.diagnosis_description || '—'}
                  </td>
                  <td className="px-5 py-3 text-sm font-medium">{formatCurrency(claim.claim_amount)}</td>
                  <td className="px-5 py-3">
                    {claim.ai_score !== null ? (
                      <span
                        className={`text-sm font-medium ${
                          claim.ai_score >= 80 ? 'text-emerald-600' : claim.ai_score >= 60 ? 'text-amber-600' : 'text-red-600'
                        }`}
                      >
                        {claim.ai_score}
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <StatusBadge status={claim.status} />
                  </td>
                  <td className="px-5 py-3 text-sm text-slate-500">{formatDate(claim.updated_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
