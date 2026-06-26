import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/Layout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { ClaimsListPage } from './pages/ClaimsListPage';
import { ClaimFormPage } from './pages/ClaimFormPage';
import { ClaimDetailPage } from './pages/ClaimDetailPage';

function ProtectedRoute({ children, role }: { children: React.ReactNode; role?: 'provider' | 'payer' }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" replace />;
  if (role && user.role !== role) return <Navigate to={`/${user.role}/dashboard`} replace />;
  return <>{children}</>;
}

function AppRoutes() {
  const { user, ready } = useAuth();

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-3 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to={`/${user.role}/dashboard`} replace /> : <LoginPage />} />

      <Route
        path="/provider"
        element={
          <ProtectedRoute role="provider">
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="claims" element={<ClaimsListPage />} />
        <Route path="claims/new" element={<ClaimFormPage />} />
        <Route path="claims/:id/edit" element={<ClaimFormPage />} />
        <Route path="claims/:id" element={<ClaimDetailPage />} />
      </Route>

      <Route
        path="/payer"
        element={
          <ProtectedRoute role="payer">
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="claims" element={<ClaimsListPage />} />
        <Route path="claims/:id" element={<ClaimDetailPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
