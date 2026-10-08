import React from 'react';
import { 
  Wallet, 
  Calendar, 
  Sparkles, 
  ArrowUpRight, 
  Clock, 
  ShieldCheck,
  TrendingUp,
  UploadCloud
} from 'lucide-react';
import { formatINR } from '../../utils/formatters.js';

export function FinancialHero({
  userName = 'there',
  availableBalance = 78450,
  safeToSpendTotal = 55889,
  runwayDays = 47,
  upcomingBillsCount = 4,
  onNavigate
}) {
  // Time-aware greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // Current formatted date
  const currentDateFormatted = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  // Calculate safe to spend today: dynamic calculation (~safeToSpend / 30 or availableBalance / 30)
  // When availableBalance is 78450, 78450 / 30 = 2615!
  const safeToSpendToday = Math.round(availableBalance / 30);

  return (
    <div 
      className="glass-panel" 
      style={{ 
        padding: '30px 32px', 
        background: '#FFFFFF', 
        border: '1px solid var(--border-color)', 
        borderRadius: '20px',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Top row: Greeting & Date */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '22px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
            <Calendar size={14} color="var(--primary)" />
            <span style={{ fontWeight: 500 }}>{currentDateFormatted}</span>
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, letterSpacing: '-0.025em' }}>
            {getGreeting()}, <span style={{ color: 'var(--primary)' }}>{userName}</span>
          </h2>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div 
            onClick={() => onNavigate && onNavigate('/cash-flow')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--badge-bg)',
              border: '1px solid #D6E7DC',
              fontSize: '0.78rem',
              color: 'var(--primary)',
              fontWeight: 600,
              cursor: 'pointer'
            }}
            title="Click to view full cash flow runway"
          >
            <Clock size={13} />
            <span>{runwayDays}-Day Runway</span>
            <ArrowUpRight size={13} />
          </div>

          <button 
            type="button"
            onClick={() => onNavigate && onNavigate('/upload-transactions')}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.78rem', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <UploadCloud size={14} color="var(--primary)" />
            <span>Upload Statement</span>
          </button>
        </div>
      </div>

      {/* Main Hero Financial Balance Split */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', alignItems: 'center' }}>
        
        {/* Available Balance Core */}
        <div 
          onClick={() => onNavigate && onNavigate('/cash-flow')}
          style={{ cursor: 'pointer' }}
          title="Click to view Cash Flow analysis"
        >
          <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.06em', marginBottom: '6px' }}>
            Available Balance
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <span style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.035em', lineHeight: 1.1 }}>
              {formatINR(availableBalance)}
            </span>
            <span style={{ fontSize: '0.86rem', color: 'var(--text-muted)', fontWeight: 500 }}>INR</span>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '6px 0 0 0' }}>
            Liquid funds across connected consented accounts
          </p>
        </div>

        {/* Safe to Spend Today Card */}
        <div 
          onClick={() => onNavigate && onNavigate('/cash-flow')}
          style={{
            background: 'var(--bg-card-subtle)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            padding: '20px 24px',
            cursor: 'pointer',
            transition: 'border-color 0.2s, box-shadow 0.2s'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'var(--primary)';
            e.currentTarget.style.boxShadow = 'var(--shadow-subtle)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'var(--border-color)';
            e.currentTarget.style.boxShadow = 'none';
          }}
          title="Daily discretionary spending recommendation"
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>
              Safe to spend today
            </span>
            <span className="badge badge-emerald" style={{ fontSize: '0.68rem', padding: '2px 8px' }}>
              Recommended Daily
            </span>
          </div>

          <div style={{ fontSize: '1.9rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '-0.03em', lineHeight: 1.15 }}>
            {formatINR(safeToSpendToday)}
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500, marginLeft: '4px' }}>/ day</span>
          </div>

          <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>{formatINR(safeToSpendTotal)} total monthly cushion</span>
            <span style={{ color: 'var(--primary)', fontWeight: 600 }}>Forecast details →</span>
          </div>
        </div>

      </div>
    </div>
  );
}
