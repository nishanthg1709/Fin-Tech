import React from 'react';
import { ArrowRight, Building2, Search, BarChart3 } from 'lucide-react';

export function OnboardingView({ user, onNavigate }) {
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
      <div className="glass-card" style={{ maxWidth: '640px', width: '100%', padding: '40px' }}>
        
        {/* Progress Bar Header (4 Steps) */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '0.78rem', fontWeight: 600 }}>
            <span style={{ color: 'var(--primary)' }}>1 Account</span>
            <span style={{ color: 'var(--text-muted)' }}>2 Connect</span>
            <span style={{ color: 'var(--text-muted)' }}>3 Analyze</span>
            <span style={{ color: 'var(--text-muted)' }}>4 Dashboard</span>
          </div>

          <div style={{ width: '100%', height: '5px', background: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ width: '25%', height: '100%', background: 'var(--primary)', borderRadius: '4px' }} />
          </div>
        </div>

        {/* Title */}
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '1.65rem', color: 'var(--text-main)', marginBottom: '8px' }}>
            Let's get your spending <span style={{ color: 'var(--primary)' }}>organized</span>.
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
            Welcome, <strong style={{ color: 'var(--text-main)' }}>{user?.name || 'there'}</strong>! Next, we'll connect your financial institution account to inspect your recurring commitments and price trends.
          </p>
        </div>

        {/* Steps Preview */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px', background: '#FFFFFF', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <div className="icon-box-mint">
              <Building2 size={19} color="var(--primary)" />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.92rem', color: 'var(--text-main)' }}>
                Select a bank or provide account details
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Choose HDFC, ICICI, SBI, Axis, or enter details
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px', background: '#FFFFFF', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <div className="icon-box-mint">
              <Search size={19} color="var(--primary)" />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.92rem', color: 'var(--text-main)' }}>
                Review consented data terms
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Read-only analysis with zero password retention
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px', background: '#FFFFFF', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <div className="icon-box-mint">
              <BarChart3 size={19} color="var(--primary)" />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.92rem', color: 'var(--text-main)' }}>
                Analyze and view your dashboard
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                View 1 Month, 3 Months, 6 Months, and 1 Year recurring expenses
              </div>
            </div>
          </div>
        </div>

        {/* Continue Button */}
        <button 
          onClick={() => onNavigate('/connect-bank')}
          className="btn btn-primary btn-lg"
          style={{ width: '100%' }}
        >
          <span>Continue to Connect Bank</span>
          <ArrowRight size={16} />
        </button>

      </div>
    </div>
  );
}
