import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Activity, FileText, LayoutDashboard, LogOut, PlusCircle, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { NotificationBell } from './NotificationBell';

export function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const isProvider = user.role === 'provider';
  const base = isProvider ? '/provider' : '/payer';
  const accent = isProvider ? 'text-emerald-600' : 'text-violet-600';
  const accentBg = isProvider ? 'bg-emerald-50' : 'bg-violet-50';

  const navItems = isProvider
    ? [
        { to: `${base}/dashboard`, icon: LayoutDashboard, label: 'Dashboard' },
        { to: `${base}/claims`, icon: FileText, label: 'My Authorizations' },
        { to: `${base}/claims/new`, icon: PlusCircle, label: 'New Auth Request' },
      ]
    : [
        { to: `${base}/dashboard`, icon: LayoutDashboard, label: 'Dashboard' },
        { to: `${base}/claims`, icon: FileText, label: 'Auth Queue' },
      ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-lg ${accentBg}`}>
              <Activity className={`w-5 h-5 ${accent}`} />
            </div>
            <div>
              <h1 className="font-bold text-slate-900 text-sm leading-tight">HealthConnector</h1>
              <p className="text-xs text-slate-500">FHIR Prior Authorization</p>
            </div>
          </div>
        </div>

        <div className="px-4 py-3 mx-3 mt-4 rounded-lg bg-slate-50">
          <div className="flex items-center gap-2">
            <Shield className={`w-4 h-4 ${accent}`} />
            <span className={`text-xs font-semibold uppercase tracking-wide ${accent}`}>
              {isProvider ? 'Provider Portal' : 'Payer Portal'}
            </span>
          </div>
          <p className="text-sm font-medium text-slate-900 mt-1 truncate">{user.name}</p>
          <p className="text-xs text-slate-500 truncate">{user.organization}</p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? `${accentBg} ${accent}`
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-slate-100">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-end px-6 gap-4">
          <NotificationBell />
        </header>
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
