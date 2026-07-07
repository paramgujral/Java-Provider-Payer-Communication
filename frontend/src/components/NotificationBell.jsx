import { useEffect, useRef, useState } from 'react'
import { formatDateTime } from '../api'

const TYPE_ICONS = { SUCCESS: '✅', ERROR: '⛔', WARNING: '⚠️', INFO: 'ℹ️' }

/** Notification bell with unread badge and dropdown. */
export default function NotificationBell({ api }) {
  const [unread, setUnread] = useState(0)
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState([])
  const wrapRef = useRef(null)

  useEffect(() => {
    let cancelled = false
    const poll = async () => {
      try {
        const { unread } = await api.unreadCount()
        if (!cancelled) setUnread(unread)
      } catch {
        /* service starting up — try again on next tick */
      }
    }
    poll()
    const timer = setInterval(poll, 5000)
    return () => {
      cancelled = true
      clearInterval(timer)
    }
  }, [api])

  useEffect(() => {
    const onClick = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const toggle = async () => {
    if (!open) {
      try {
        setItems(await api.notifications())
      } catch {
        setItems([])
      }
    }
    setOpen(!open)
  }

  const markAll = async () => {
    await api.markAllRead()
    setUnread(0)
    setItems(items.map((n) => ({ ...n, read: true })))
  }

  return (
    <div className="bell-wrap" ref={wrapRef}>
      <button className="bell" onClick={toggle} aria-label={`Notifications (${unread} unread)`}>
        🔔
        {unread > 0 && <span className="badge">{unread > 99 ? '99+' : unread}</span>}
      </button>
      {open && (
        <div className="notif-panel">
          <div className="notif-head">
            <span>Notifications</span>
            <button onClick={markAll}>Mark all as read</button>
          </div>
          {items.length === 0 && <div className="notif-empty">No notifications yet</div>}
          {items.map((n) => (
            <div key={n.id} className={`notif-item ${n.read ? '' : 'unread'}`}>
              <div className="t">
                {TYPE_ICONS[n.type] || 'ℹ️'} {n.title}
              </div>
              <div className="m">{n.message}</div>
              <div className="d">{formatDateTime(n.createdAt)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
