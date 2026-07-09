import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import StatusPill from '../components/StatusPill';

const STATUS_FILTERS = ['ALL', 'DRAFT', 'SUBMITTED', 'IN_REVIEW', 'PENDED', 'APPROVED', 'PARTIAL', 'REJECTED', 'CANCELLED'];

export default function Dashboard() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const params = filter !== 'ALL' ? { status: filter } : {};
      const res = await api.get('/auth-requests', { params });
      setRequests(res.data);
    } catch (e) {
      // silent
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const isProvider = user?.role === 'PROVIDER';

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>{isProvider ? 'Authorization Requests' : 'Incoming Authorization Requests'}</h1>
          <div className="subtitle">
            {isProvider
              ? `Requests submitted by ${user.organizationName}`
              : `Requests addressed to ${user.organizationName}`}
          </div>
        </div>
        {isProvider && (
          <Link to="/new-request" className="btn btn-primary">+ New Authorization Request</Link>
        )}
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {STATUS_FILTERS.map(s => (
          <button
            key={s}
            className={`btn btn-sm ${filter === s ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter(s)}
          >
            {s.replace('_', ' ')}
          </button>
        ))}
      </div>

      <div className="card" style={{ padding: 0 }}>
        {loading ? (
          <div className="empty-state">Loading requests...</div>
        ) : requests.length === 0 ? (
          <div className="empty-state">
            <h3>No requests here yet</h3>
            <p>
              {isProvider
                ? 'Create a new authorization request to get started.'
                : 'Requests submitted to your organization will appear here.'}
            </p>
          </div>
        ) : (
          <table className="req-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Patient</th>
                <th>Procedure</th>
                <th>{isProvider ? 'Payer' : 'Provider'}</th>
                <th>AI Score</th>
                <th>Status</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody>
              {requests.map(r => (
                <tr key={r.fhirId}>
                  <td><Link to={`/requests/${r.fhirId}`}>{r.fhirId}</Link></td>
                  <td>{r.patientName}</td>
                  <td>{r.procedureCode} &ndash; {r.procedureDescription}</td>
                  <td>{isProvider ? r.payerOrgName : r.providerOrgName}</td>
                  <td>
                    {r.aiCompletenessScore != null ? (
                      <span style={{ color: r.aiFlaggedIssues ? 'var(--color-status-pended)' : 'var(--color-status-approved)', fontWeight: 700 }}>
                        {r.aiCompletenessScore}
                      </span>
                    ) : '—'}
                  </td>
                  <td><StatusPill status={r.status} /></td>
                  <td>{new Date(r.updatedAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
