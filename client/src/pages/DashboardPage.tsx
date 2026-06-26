import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle,
  Clock,
  DollarSign,
  FileText,
  RefreshCw,
  Send,
  XCircle,
} from 'lucide-react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { StatusBadge, formatCurrency } from '../components/ui';
import type { DashboardStats } from '../types';
import { StatusChart } from '../components/StatusChart';

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}

export function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const isProvider = user?.role === 'provider';

  useEffect(() => {
    if (!user) return;
    api.getDashboard(user.id).then(setStats);
  }, [user?.id]);

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-3 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 mt-1">
          {isProvider
            ? 'Track authorization requests and payer responses'
            : 'Overview of prior auth queue and review status'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Claims" value={stats.total} icon={FileText} color="bg-blue-50 text-blue-600" />
        <StatCard
          label="Pending Review"
          value={stats.submitted + stats.under_review}
          icon={Clock}
          color="bg-amber-50 text-amber-600"
        />
        <StatCard label="Approved" value={stats.approved} icon={CheckCircle} color="bg-emerald-50 text-emerald-600" />
        <StatCard label="Rejected" value={stats.rejected} icon={XCircle} color="bg-red-50 text-red-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        <StatCard
          label="Total Claim Value"
          value={formatCurrency(stats.totalAmount)}
          icon={DollarSign}
          color="bg-violet-50 text-violet-600"
        />
        <StatCard
          label="Approved Amount"
          value={formatCurrency(stats.approvedAmount)}
          icon={CheckCircle}
          color="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          label="Pending Amount"
          value={formatCurrency(stats.pendingAmount)}
          icon={Send}
          color="bg-amber-50 text-amber-600"
        />
      </div>

      {isProvider && stats.revision_requested > 0 && (
        <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-xl flex items-center gap-3">
          <RefreshCw className="w-5 h-5 text-orange-600" />
          <div>
            <p className="font-medium text-orange-800">
              {stats.revision_requested} claim(s) need revision
            </p>
            <p className="text-sm text-orange-600">Review payer feedback and resubmit</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <StatusChart stats={stats} showDraft={isProvider} />
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-900 mb-3">Quick Summary</h2>
          <ul className="space-y-2 text-sm text-slate-600">
            <li className="flex justify-between">
              <span>Approval rate</span>
              <span className="font-medium text-slate-900">
                {stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0}%
              </span>
            </li>
            <li className="flex justify-between">
              <span>Avg claim value</span>
              <span className="font-medium text-slate-900">
                {formatCurrency(stats.total > 0 ? stats.totalAmount / stats.total : 0)}
              </span>
            </li>
            <li className="flex justify-between">
              <span>Pending value</span>
              <span className="font-medium text-amber-600">{formatCurrency(stats.pendingAmount)}</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">Recent Claims</h2>
          <Link
            to={isProvider ? '/provider/claims' : '/payer/claims'}
            className="text-sm text-brand-600 hover:text-brand-700 font-medium"
          >
            View all →
          </Link>
        </div>
        {stats.recentClaims.length === 0 ? (
          <p className="px-5 py-8 text-center text-slate-500">No claims yet</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {stats.recentClaims.map((claim) => (
              <Link
                key={claim.id}
                to={`/${user!.role}/claims/${claim.id}`}
                className="flex items-center justify-between px-5 py-3 hover:bg-slate-50 transition-colors"
              >
                <div>
                  <p className="font-medium text-slate-900">{claim.patient_name || 'Unnamed Patient'}</p>
                  <p className="text-sm text-slate-500">
                    {claim.diagnosis_description || 'No diagnosis'} · {formatCurrency(claim.claim_amount)}
                  </p>
                </div>
                <StatusBadge status={claim.status} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
