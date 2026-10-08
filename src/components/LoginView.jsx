import React, { useState } from 'react';
import { ArrowRight, ArrowLeft, Eye, EyeOff, ShieldCheck } from 'lucide-react';

export function LoginView({ onLogin, onNavigate }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    try {
      const res = await onLogin({ email: email.trim(), password });
      if (res && res.error) {
        setError(res.error);
      }
    } catch (err) {
      setError(err?.message || 'Unable to connect to the server.');
    } finally {
      setIsSubmitting(false);
    }
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

      <div className="glass-card" style={{ maxWidth: '420px', width: '100%', padding: '36px', background: '#FFFFFF' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '6px', letterSpacing: '-0.02em' }}>
            Log In
          </h2>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', margin: 0 }}>
            Access your personal finance intelligence dashboard
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
            <label style={{ fontSize: '0.8rem', color: 'var(--text-main)', display: 'block', marginBottom: '6px', fontWeight: 600 }}>
              Email Address
            </label>
            <input 
              type="email" 
              className="input-text" 
              placeholder="name@example.com"
              value={email}
              autoComplete="email"
              onChange={e => { setEmail(e.target.value); setError(''); }}
              required
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-main)', margin: 0, fontWeight: 600 }}>
                Password
              </label>
              <button 
                type="button"
                onClick={() => setError('Please enter any password to log into your account session.')}
                style={{ background: 'transparent', border: 'none', padding: 0, fontSize: '0.74rem', color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }}
              >
                Forgot password?
              </button>
            </div>
            <div style={{ position: 'relative' }}>
              <input 
                type={showPassword ? 'text' : 'password'} 
                className="input-text" 
                placeholder="••••••••••••"
                value={password}
                autoComplete="current-password"
                onChange={e => { setPassword(e.target.value); setError(''); }}
                style={{ paddingRight: '38px' }}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center'
                }}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="btn btn-primary" 
            style={{ marginTop: '8px', width: '100%', height: '42px', opacity: isSubmitting ? 0.75 : 1 }}
          >
            <span>{isSubmitting ? 'Signing In...' : 'Log In'}</span>
            <ArrowRight size={15} />
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          Don't have an account?{' '}
          <button 
            type="button"
            onClick={() => onNavigate('/signup')}
            style={{ background: 'transparent', border: 'none', padding: 0, color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }}
          >
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
}
