import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Building2, Shield } from 'lucide-react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

const DEMO_ACCOUNTS = [
  { email: 'provider@cityhospital.com', label: 'City General Hospital', role: 'provider' as const },
  { email: 'clinic@sunrise.com', label: 'Sunrise Medical Clinic', role: 'provider' as const },
  { email: 'payer@healthguard.com', label: 'HealthGuard Insurance', role: 'payer' as const },
  { email: 'payer@careplus.com', label: 'CarePlus Insurance', role: 'payer' as const },
];

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (loginEmail?: string) => {
    const e = loginEmail || email;
    if (!e) {
      setError('Please enter an email or select a demo account');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { user } = await api.login(e);
      login(user);
      navigate(user.role === 'provider' ? '/provider/dashboard' : '/payer/dashboard');
    } catch {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-brand-900 to-violet-900 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur rounded-2xl mb-4">
            <Activity className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">Healthcare Connector Platform</h1>
          <p className="text-slate-300 mt-2">
            FHIR R4 prior authorization — provider & payer modules with AI co-pilot
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-xl font-semibold text-slate-900 mb-6">Sign In</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg">{error}</div>
          )}

          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              placeholder="Enter your email"
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
            />
          </div>

          <button
            onClick={() => handleLogin()}
            disabled={loading}
            className="w-full py-2.5 bg-brand-600 text-white font-medium rounded-lg hover:bg-brand-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          <div className="mt-8">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Demo Accounts</p>
            <div className="space-y-2">
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.email}
                  onClick={() => handleLogin(acc.email)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:border-brand-300 hover:bg-brand-50 transition-colors text-left"
                >
                  {acc.role === 'provider' ? (
                    <Building2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  ) : (
                    <Shield className="w-5 h-5 text-violet-600 shrink-0" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-slate-900">{acc.label}</p>
                    <p className="text-xs text-slate-500">
                      {acc.role === 'provider' ? 'Provider' : 'Payer'} · {acc.email}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
