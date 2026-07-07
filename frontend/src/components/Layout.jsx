import { NavLink, Outlet, useLocation } from 'react-router-dom'
import NotificationBell from './NotificationBell'
import { payerApi, providerApi } from '../api'

export default function Layout() {
  const { pathname } = useLocation()
  const isPayer = pathname.startsWith('/payer')

  return (
    <>
      <header className="topbar">
        <div className="brand">
          Health<span>Connect</span>
        </div>
        <nav className="role-switch" aria-label="Portal">
          <NavLink to="/provider" className={({ isActive }) => (isActive || !isPayer ? 'active' : '')}>
            🏥 Provider portal
          </NavLink>
          <NavLink to="/payer" className={({ isActive }) => (isActive || isPayer ? 'active' : '')}>
            🛡️ Payer portal
          </NavLink>
        </nav>
        <div className="spacer" />
        <NotificationBell key={isPayer ? 'payer' : 'provider'} api={isPayer ? payerApi : providerApi} />
      </header>
      <main className="page">
        <Outlet />
      </main>
    </>
  )
}
