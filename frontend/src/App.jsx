import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import ProviderDashboard from './pages/ProviderDashboard'
import RequestForm from './pages/RequestForm'
import RequestDetail from './pages/RequestDetail'
import PayerDashboard from './pages/PayerDashboard'
import CaseDetail from './pages/CaseDetail'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Navigate to="/provider" replace />} />
        <Route path="/provider" element={<ProviderDashboard />} />
        <Route path="/provider/new" element={<RequestForm />} />
        <Route path="/provider/requests/:id" element={<RequestDetail />} />
        <Route path="/provider/requests/:id/edit" element={<RequestForm />} />
        <Route path="/payer" element={<PayerDashboard />} />
        <Route path="/payer/cases/:id" element={<CaseDetail />} />
      </Route>
    </Routes>
  )
}
