import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: '', password: '', fullName: '', organizationName: '', email: '', role: 'PROVIDER',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await register(form);
      setSuccess('Account created. You can now sign in.');
      setTimeout(() => navigate('/login'), 1200);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card" style={{ width: 460 }}>
        <h1>Create your <span className="accent">account</span></h1>
        <div className="tagline">Register your organization as a Provider or Payer</div>
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Account type</label>
            <div className="role-toggle">
              <button type="button" className={form.role === 'PROVIDER' ? 'selected' : ''} onClick={() => update('role', 'PROVIDER')}>Provider</button>
              <button type="button" className={form.role === 'PAYER' ? 'selected' : ''} onClick={() => update('role', 'PAYER')}>Payer</button>
            </div>
          </div>
          <div className="field">
            <label>Full name</label>
            <input value={form.fullName} onChange={e => update('fullName', e.target.value)} required />
          </div>
          <div className="field">
            <label>{form.role === 'PROVIDER' ? 'Provider organization name' : 'Payer organization name'}</label>
            <input value={form.organizationName} onChange={e => update('organizationName', e.target.value)} required
                   placeholder={form.role === 'PROVIDER' ? 'e.g. Lakeside Medical Group' : 'e.g. Northstar Health Plan'} />
          </div>
          <div className="field">
            <label>Email</label>
            <input type="email" value={form.email} onChange={e => update('email', e.target.value)} required />
          </div>
          <div className="field">
            <label>Username</label>
            <input value={form.username} onChange={e => update('username', e.target.value)} required />
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" value={form.password} onChange={e => update('password', e.target.value)} required />
          </div>
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>
        <div className="switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
