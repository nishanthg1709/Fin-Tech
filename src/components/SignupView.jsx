import React, { useState } from 'react';
import { ArrowRight, ArrowLeft } from 'lucide-react';

export function SignupView({ onSignup, onNavigate }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!email.trim()) {
      setError('Please enter your email.');
      return;
    }
    if (password.length < 4) {
      setError('Password must be at least 4 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    onSignup({
      name: name.trim(),
      email: email.trim(),
      password
    });
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
      <div style={{ width: '100%', maxWidth: '440px', marginBottom: '16px' }}>
        <button 
          onClick={() => onNavigate('/')}
          className="btn btn-secondary btn-sm"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <ArrowLeft size={14} />
          <span>Back to Home</span>
        </button>
      </div>

      <div className="glass-card" style={{ maxWidth: '440px', width: '100%', padding: '36px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1.5rem', color: 'var(--text-main)', marginBottom: '6px' }}>
            Create Account
          </h2>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', margin: 0 }}>
            Start tracking and organizing your recurring spending
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
            marginBottom: '16px'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-main)', display: 'block', marginBottom: '6px', fontWeight: 500 }}>
              Full Name
            </label>
            <input 
              type="text" 
              className="input-text" 
              placeholder="e.g. Rahul Sharma"
              value={name}
              onChange={e => { setName(e.target.value); setError(''); }}
              required
            />
          </div>

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
            <label style={{ fontSize: '0.8rem', color: 'var(--text-main)', display: 'block', marginBottom: '6px', fontWeight: 500 }}>
              Password
            </label>
            <input 
              type="password" 
              className="input-text" 
              placeholder="••••••••••••"
              value={password}
              onChange={e => { setPassword(e.target.value); setError(''); }}
              required
            />
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-main)', display: 'block', marginBottom: '6px', fontWeight: 500 }}>
              Confirm Password
            </label>
            <input 
              type="password" 
              className="input-text" 
              placeholder="••••••••••••"
              value={confirmPassword}
              onChange={e => { setConfirmPassword(e.target.value); setError(''); }}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ marginTop: '8px', width: '100%' }}>
            <span>Create Account</span>
            <ArrowRight size={15} />
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '22px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <span 
            onClick={() => onNavigate('/login')}
            style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }}
          >
            Log In
          </span>
        </div>
      </div>
    </div>
  );
}
