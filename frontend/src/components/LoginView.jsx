import React, { useState } from 'react';
import { Lock, User, ShieldCheck, ArrowRight, Stethoscope, Building2, Truck, Sparkles, CheckCircle2 } from 'lucide-react';

export default function LoginView({ onLoginSuccess }) {
  const [role, setRole] = useState('DOCTOR'); // 'DOCTOR' | 'MINISTER' | 'SUPPLIER'
  const [username, setUsername] = useState('doctor@health.gov');
  const [password, setPassword] = useState('doctor123');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleRoleSelect = (newRole) => {
    setRole(newRole);
    if (newRole === 'DOCTOR') {
      setUsername('doctor@health.gov');
      setPassword('doctor123');
    } else if (newRole === 'MINISTER') {
      setUsername('minister@health.gov');
      setPassword('minister123');
    } else if (newRole === 'SUPPLIER') {
      setUsername('supplier@health.gov');
      setPassword('supplier123');
    }
  };

  const handleLogin = (e) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    setTimeout(() => {
      if (username.trim() && password.trim()) {
        let name = 'Health Officer';
        let assignedClinicId = null;
        let assignedCity = 'Chennai';

        if (role === 'DOCTOR') {
          name = 'Dr. Priya Ramesh (Chief Doctor)';
          assignedClinicId = 'CHE-042';
          assignedCity = 'Chennai';
        } else if (role === 'MINISTER') {
          name = 'Hon. Health Minister / State Authority';
        } else if (role === 'SUPPLIER') {
          name = 'Central Medical Supply Depot (TN)';
        }

        const userData = {
          username: username.trim(),
          name,
          role,
          assignedClinicId,
          assignedCity,
          token: 'demo-auth-token-' + Date.now(),
          loginTime: new Date().toISOString()
        };

        localStorage.setItem('sanjeevani_auth', JSON.stringify(userData));
        setIsLoading(false);
        onLoginSuccess(userData);
      } else {
        setIsLoading(false);
        setErrorMessage('Please enter both username and password.');
      }
    }, 400);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem',
      background: 'radial-gradient(circle at 50% 15%, rgba(6, 182, 212, 0.12) 0%, rgba(10, 14, 23, 0.98) 75%)',
    }}>
      <div className="content-card animate-fade" style={{
        maxWidth: '490px',
        width: '100%',
        padding: '2.75rem 2.2rem',
        borderRadius: 'var(--radius-xl)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 40px rgba(6, 182, 212, 0.12)',
        border: '1px solid rgba(6, 182, 212, 0.28)',
        background: 'rgba(17, 24, 39, 0.88)',
        backdropFilter: 'blur(16px)'
      }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{
            fontSize: '1.85rem',
            fontWeight: 800,
            letterSpacing: '0.02em',
            background: 'linear-gradient(90deg, #ffffff, #67e8f9)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '0.45rem'
          }}>
            HEALTHFLOW AI
          </h1>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            National Healthcare Resource & Supply Chain Resilience Platform
          </p>

          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            marginTop: '0.75rem',
            padding: '0.22rem 0.75rem',
            borderRadius: '9999px',
            background: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            color: '#34d399',
            fontSize: '0.72rem',
            fontWeight: 600
          }}>
            <ShieldCheck size={13} /> Official Health Administration Portal
          </div>
        </div>

        {/* Role Selector Tabs */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.45rem' }}>
            Select Operational Role
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => handleRoleSelect('DOCTOR')}
              style={{
                background: role === 'DOCTOR' ? 'rgba(16, 185, 129, 0.18)' : 'var(--bg-surface-elevated)',
                border: `1px solid ${role === 'DOCTOR' ? '#10b981' : 'var(--border-subtle)'}`,
                color: role === 'DOCTOR' ? '#34d399' : 'var(--text-secondary)',
                padding: '0.6rem 0.4rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.35rem',
                transition: 'all 0.2s'
              }}
            >
              <Stethoscope size={18} />
              <span>DOCTOR</span>
            </button>

            <button
              type="button"
              onClick={() => handleRoleSelect('MINISTER')}
              style={{
                background: role === 'MINISTER' ? 'rgba(139, 92, 246, 0.18)' : 'var(--bg-surface-elevated)',
                border: `1px solid ${role === 'MINISTER' ? '#8b5cf6' : 'var(--border-subtle)'}`,
                color: role === 'MINISTER' ? '#c084fc' : 'var(--text-secondary)',
                padding: '0.6rem 0.4rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.35rem',
                transition: 'all 0.2s'
              }}
            >
              <Building2 size={18} />
              <span>MINISTER</span>
            </button>

            <button
              type="button"
              onClick={() => handleRoleSelect('SUPPLIER')}
              style={{
                background: role === 'SUPPLIER' ? 'rgba(245, 158, 11, 0.18)' : 'var(--bg-surface-elevated)',
                border: `1px solid ${role === 'SUPPLIER' ? '#f59e0b' : 'var(--border-subtle)'}`,
                color: role === 'SUPPLIER' ? '#fbbf24' : 'var(--text-secondary)',
                padding: '0.6rem 0.4rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.35rem',
                transition: 'all 0.2s'
              }}
            >
              <Truck size={18} />
              <span>SUPPLIER</span>
            </button>
          </div>
        </div>

        {errorMessage && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            color: '#f87171',
            padding: '0.65rem',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.78rem',
            marginBottom: '1rem',
            textAlign: 'center'
          }}>
            {errorMessage}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
              Official Email / Username
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="filter-select"
                style={{ width: '100%', paddingLeft: '2.4rem', fontSize: '0.88rem' }}
              />
              <User size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          <div style={{ marginBottom: '1.4rem' }}>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="filter-select"
                style={{ width: '100%', paddingLeft: '2.4rem', fontSize: '0.88rem' }}
              />
              <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={isLoading}
            style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', fontSize: '0.92rem' }}
          >
            {isLoading ? 'Authenticating...' : (
              <>
                Sign In as {role} <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Credentials Footer */}
        <div style={{ marginTop: '1.25rem', paddingTop: '1.15rem', borderTop: '1px solid var(--border-subtle)', textAlign: 'center' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
            Demo Credentials for Evaluators:
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap', fontSize: '0.72rem' }}>
            <span style={{ color: '#34d399' }}>doctor@health.gov (doctor123)</span> •
            <span style={{ color: '#c084fc' }}>minister@health.gov (minister123)</span> •
            <span style={{ color: '#fbbf24' }}>supplier@health.gov (supplier123)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
