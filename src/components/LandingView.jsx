import React from 'react';
import { 
  ArrowRight, 
  Repeat, 
  TrendingUp, 
  Calendar, 
  PieChart, 
  ShieldCheck, 
  Check
} from 'lucide-react';

export function LandingView({ onNavigate }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-page)' }}>
      
      {/* 1. HEADER */}
      <header style={{
        padding: '18px 36px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid var(--border-color)',
        background: '#FFFFFF',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        {/* Brand */}
        <div style={{ cursor: 'pointer' }} onClick={() => onNavigate('/')}>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.025em', lineHeight: 1.2 }}>
            Smart <span style={{ color: 'var(--primary)' }}>Expense</span>
          </div>
          <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
            & Subscriptions Manager
          </div>
        </div>

        {/* Right side buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button 
            onClick={() => onNavigate('/login')}
            className="btn btn-secondary btn-sm"
          >
            Log In
          </button>
          <button 
            onClick={() => onNavigate('/signup')}
            className="btn btn-primary btn-sm"
          >
            Sign Up
          </button>
        </div>
      </header>

      {/* 2. HERO */}
      <section style={{
        maxWidth: '920px',
        margin: '0 auto',
        padding: '80px 24px 50px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        <div className="badge badge-emerald" style={{ marginBottom: '20px', padding: '6px 14px' }}>
          <span>Financial Intelligence & Recurring Insights</span>
        </div>

        <h1 style={{
          fontSize: 'clamp(2.4rem, 5vw, 3.6rem)',
          fontWeight: 800,
          lineHeight: 1.15,
          marginBottom: '22px',
          color: 'var(--text-main)',
          letterSpacing: '-0.03em'
        }}>
          Know what you're <span style={{ color: 'var(--primary)' }}>paying for</span>.
        </h1>

        <p style={{
          fontSize: '1.15rem',
          color: 'var(--text-muted)',
          maxWidth: '640px',
          lineHeight: 1.6,
          marginBottom: '36px'
        }}>
          Connect your account, discover recurring subscriptions, detect price hikes, and project your safe-to-spend runway.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button 
            onClick={() => onNavigate('/signup')}
            className="btn btn-primary btn-lg"
          >
            <span>Get Started</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </section>

      {/* 3. FEATURE CARDS */}
      <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '20px 24px 60px', width: '100%' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '20px'
        }}>
          {/* Card 1: Recurring Payments */}
          <div className="glass-card" style={{ padding: '28px' }}>
            <div className="icon-box-mint" style={{ marginBottom: '18px' }}>
              <Repeat size={19} color="var(--primary)" />
            </div>
            <h3 style={{ fontSize: '1.05rem', color: 'var(--text-main)', marginBottom: '8px' }}>
              Recurring Payments
            </h3>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
              Find payments that repeat every 1 month, 3 months, 6 months or 1 year.
            </p>
          </div>

          {/* Card 2: Price Changes */}
          <div className="glass-card" style={{ padding: '28px' }}>
            <div className="icon-box-mint" style={{ marginBottom: '18px' }}>
              <TrendingUp size={19} color="var(--primary)" />
            </div>
            <h3 style={{ fontSize: '1.05rem', color: 'var(--text-main)', marginBottom: '8px' }}>
              Price Changes
            </h3>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
              Instantly track when recurring subscriptions increase in price.
            </p>
          </div>

          {/* Card 3: Upcoming Payments */}
          <div className="glass-card" style={{ padding: '28px' }}>
            <div className="icon-box-mint" style={{ marginBottom: '18px' }}>
              <Calendar size={19} color="var(--primary)" />
            </div>
            <h3 style={{ fontSize: '1.05rem', color: 'var(--text-main)', marginBottom: '8px' }}>
              Upcoming Payments
            </h3>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
              See expected commitments and renewal dates over 7d, 30d, 90d, and 1 year.
            </p>
          </div>

          {/* Card 4: Spending Overview */}
          <div className="glass-card" style={{ padding: '28px' }}>
            <div className="icon-box-mint" style={{ marginBottom: '18px' }}>
              <PieChart size={19} color="var(--primary)" />
            </div>
            <h3 style={{ fontSize: '1.05rem', color: 'var(--text-main)', marginBottom: '8px' }}>
              Spending Overview
            </h3>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
              Understand your category allocation and protect your liquid cash flow.
            </p>
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS */}
      <section style={{
        maxWidth: '1100px',
        margin: '0 auto',
        padding: '40px 24px 60px',
        width: '100%',
        borderTop: '1px solid var(--border-color)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <h2 style={{ fontSize: '1.8rem', color: 'var(--text-main)', marginBottom: '8px' }}>
            How it <span style={{ color: 'var(--primary)' }}>works</span>
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0 }}>
            Simple, transparent 4-step process
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '20px'
        }}>
          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '8px' }}>
              01
            </div>
            <h4 style={{ fontSize: '0.96rem', color: 'var(--text-main)', marginBottom: '6px' }}>
              Create your account
            </h4>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
              Sign up with your name and email to start your profile.
            </p>
          </div>

          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '8px' }}>
              02
            </div>
            <h4 style={{ fontSize: '0.96rem', color: 'var(--text-main)', marginBottom: '6px' }}>
              Connect your account
            </h4>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
              Provide account details and review read-only terms.
            </p>
          </div>

          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '8px' }}>
              03
            </div>
            <h4 style={{ fontSize: '0.96rem', color: 'var(--text-main)', marginBottom: '6px' }}>
              Automated Analysis
            </h4>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
              Clean narrations, identify intervals, and flag anomalies.
            </p>
          </div>

          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '8px' }}>
              04
            </div>
            <h4 style={{ fontSize: '0.96rem', color: 'var(--text-main)', marginBottom: '6px' }}>
              Review Dashboard
            </h4>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
              Track cash flow graphs, category allocation, and commitments.
            </p>
          </div>
        </div>
      </section>

      {/* 5. SECURITY SECTION */}
      <section style={{
        maxWidth: '820px',
        margin: '0 auto',
        padding: '20px 24px 60px',
        width: '100%'
      }}>
        <div className="glass-card" style={{ padding: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
            <div className="icon-box-mint">
              <ShieldCheck size={20} color="var(--primary)" />
            </div>
            <h2 style={{ fontSize: '1.25rem', color: 'var(--text-main)', margin: 0 }}>
              Your financial data stays in your control.
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              'Consent-based account connection',
              'Masked account details',
              'Zero passwords or PINs stored',
              'Read-only transaction analysis',
              'No automatic debits or external cancellations'
            ].map((item, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                <Check size={16} color="var(--primary)" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. FOOTER */}
      <footer style={{
        marginTop: 'auto',
        borderTop: '1px solid var(--border-color)',
        padding: '20px 32px',
        background: '#FFFFFF',
        textAlign: 'center',
        fontSize: '0.8rem',
        color: 'var(--text-muted)'
      }}>
        <strong style={{ color: 'var(--text-main)', fontWeight: 600 }}>Smart Expense & Subscriptions Manager</strong>
      </footer>

    </div>
  );
}
