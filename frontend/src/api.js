const PROVIDER_API = import.meta.env.VITE_PROVIDER_API || 'http://localhost:8081'
const PAYER_API = import.meta.env.VITE_PAYER_API || 'http://localhost:8082'

async function request(base, path, options = {}) {
  const res = await fetch(base + path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  const text = await res.text()
  const body = text ? JSON.parse(text) : null
  if (!res.ok) {
    const err = new Error(body?.error || `Request failed (${res.status})`)
    err.status = res.status
    err.body = body
    throw err
  }
  return body
}

export const providerApi = {
  listRequests: (status) =>
    request(PROVIDER_API, `/api/requests${status ? `?status=${status}` : ''}`),
  getRequest: (id) => request(PROVIDER_API, `/api/requests/${id}`),
  createRequest: (dto) =>
    request(PROVIDER_API, '/api/requests', { method: 'POST', body: JSON.stringify(dto) }),
  updateRequest: (id, dto) =>
    request(PROVIDER_API, `/api/requests/${id}`, { method: 'PUT', body: JSON.stringify(dto) }),
  runCopilot: (id) => request(PROVIDER_API, `/api/requests/${id}/copilot`, { method: 'POST' }),
  submitRequest: (id) => request(PROVIDER_API, `/api/requests/${id}/submit`, { method: 'POST' }),
  stats: () => request(PROVIDER_API, '/api/dashboard/stats'),
  notifications: () => request(PROVIDER_API, '/api/notifications'),
  unreadCount: () => request(PROVIDER_API, '/api/notifications/unread-count'),
  markAllRead: () => request(PROVIDER_API, '/api/notifications/read-all', { method: 'POST' }),
}

export const payerApi = {
  listCases: (status) => request(PAYER_API, `/api/cases${status ? `?status=${status}` : ''}`),
  getCase: (id) => request(PAYER_API, `/api/cases/${id}`),
  decide: (id, action, note) =>
    request(PAYER_API, `/api/cases/${id}/decision`, {
      method: 'POST',
      body: JSON.stringify({ action, note }),
    }),
  stats: () => request(PAYER_API, '/api/dashboard/stats'),
  notifications: () => request(PAYER_API, '/api/notifications'),
  unreadCount: () => request(PAYER_API, '/api/notifications/unread-count'),
  markAllRead: () => request(PAYER_API, '/api/notifications/read-all', { method: 'POST' }),
}

export function formatMoney(value) {
  if (value == null) return '—'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)
}

export function formatDateTime(value) {
  if (!value) return '—'
  return new Date(value).toLocaleString()
}
