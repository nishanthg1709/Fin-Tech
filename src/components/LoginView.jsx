import React, { useState } from 'react';
import { ArrowRight, ArrowLeft } from 'lucide-react';

export function LoginView({ onLogin, onNavigate }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }

    onLogin({ email, password });
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '24px',
      background: 'var(--bg-page)'
    }}>
      {/* Back to Home Link */}
      <div style={{ width: '100%', maxWidth: '420px', marginBottom: '16px' }}>
        <button 
          onClick={() => onNavigate('/')}
          className="btn btn-secondary btn-sm"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <ArrowLeft size={14} />
          <span>Back to Home</span>
        </button>
      </div>

      <div className="glass-card" style={{ maxWidth: '420px', width: '100%', padding: '36px' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <h2 style={{ fontSize: '1.5rem', color: 'var(--text-main)', marginBottom: '6px' }}>
            Log In
          </h2>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', margin: 0 }}>
            Access your expense & subscriptions dashboard
          </p>
        </div>

        {error && (
          <div style={{
            background: '#FEE2E2',
            border: '1px solid #FECDD3',
            borderRadius: 'var(--radius-md)',
            padding: '10px 14px',
            color: '#991B1B',
            fontSize: '0.82rem',
            marginBottom: '18px'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-main)', display: 'block', marginBottom: '6px', fontWeight: 500 }}>
              Email
            </label>
            <input 
              type="email" 
              className="input-text" 
              placeholder="name@example.com"
              value={email}
              onChange={e => { setEmail(e.target.value); setError(''); }}
              required
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-main)', margin: 0, fontWeight: 500 }}>
                Password
              </label>
              <span 
                onClick={() => alert('Enter your registered email and password to log in, or sign up for a new account.')}
                style={{ fontSize: '0.74rem', color: 'var(--primary)', cursor: 'pointer', fontWeight: 500 }}
              >
                Forgot password?
              </span>
            </div>
            <input 
              type="password" 
              className="input-text" 
              placeholder="••••••••••••"
              value={password}
              onChange={e => { setPassword(e.target.value); setError(''); }}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ marginTop: '8px', width: '100%' }}>
            <span>Log In</span>
            <ArrowRight size={15} />
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          Don't have an account?{' '}
          <span 
            onClick={() => onNavigate('/signup')}
            style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }}
          >
            Sign Up
          </span>
        </div>
      </div>
    </div>
  );
}
