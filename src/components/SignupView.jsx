import React, { useState } from 'react';
import { ArrowRight, ArrowLeft, Eye, EyeOff } from 'lucide-react';

export function SignupView({ onSignup, onNavigate }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
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

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onSignup({
        name: name.trim(),
        email: email.trim(),
        password
      });
    }, 350);
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

      <div className="glass-card" style={{ maxWidth: '440px', width: '100%', padding: '36px', background: '#FFFFFF' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '6px', letterSpacing: '-0.02em' }}>
            Create Account
          </h2>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', margin: 0 }}>
            Start tracking and organizing your personal finances
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
            <label style={{ fontSize: '0.8rem', color: 'var(--text-main)', display: 'block', marginBottom: '6px', fontWeight: 600 }}>
              Full Name
            </label>
            <input 
              type="text" 
              className="input-text" 
              placeholder="e.g. Rahul Sharma"
              value={name}
              autoComplete="name"
              onChange={e => { setName(e.target.value); setError(''); }}
              required
            />
          </div>

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
            <label style={{ fontSize: '0.8rem', color: 'var(--text-main)', display: 'block', marginBottom: '6px', fontWeight: 600 }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input 
                type={showPassword ? 'text' : 'password'} 
                className="input-text" 
                placeholder="••••••••••••"
                value={password}
                autoComplete="new-password"
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

          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-main)', display: 'block', marginBottom: '6px', fontWeight: 600 }}>
              Confirm Password
            </label>
            <input 
              type={showPassword ? 'text' : 'password'} 
              className="input-text" 
              placeholder="••••••••••••"
              value={confirmPassword}
              autoComplete="new-password"
              onChange={e => { setConfirmPassword(e.target.value); setError(''); }}
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="btn btn-primary" 
            style={{ marginTop: '8px', width: '100%', height: '42px', opacity: isSubmitting ? 0.75 : 1 }}
          >
            <span>{isSubmitting ? 'Creating Account...' : 'Create Account'}</span>
            <ArrowRight size={15} />
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '22px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <button 
            type="button"
            onClick={() => onNavigate('/login')}
            style={{ background: 'transparent', border: 'none', padding: 0, color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }}
          >
            Log In
          </button>
        </div>
      </div>
    </div>
  );
}
