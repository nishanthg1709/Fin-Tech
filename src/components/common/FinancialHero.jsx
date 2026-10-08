import React from 'react';
import { 
  Wallet, 
  Calendar, 
  Sparkles, 
  ArrowUpRight, 
  ArrowDownLeft,
  Clock, 
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  UploadCloud,
  PiggyBank,
  Percent,
  CheckCircle2
} from 'lucide-react';
import { formatINR } from '../../utils/formatters.js';

export function FinancialHero({
  userName = 'there',
  availableBalance = 78450,
  monthlyIncome = 75000,
  monthlySpending = 45365,
  monthlySavings = 29635,
  savingsRate = 39,
  safeToSpendTotal = 55889,
  runwayDays = 47,
  upcomingBillsCount = 4,
  comparison = null,
  periodLabel = null,
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

  // Calculate safe to spend today
  const safeToSpendToday = Math.max(0, Math.round(safeToSpendTotal / 30));

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
      {/* 1. Top row: Greeting, Date, Period Badge & Quick Actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
            <Calendar size={14} color="var(--primary)" />
            <span style={{ fontWeight: 500 }}>{currentDateFormatted}</span>
            {periodLabel && (
              <>
                <span style={{ color: '#CBD5E1' }}>•</span>
                <span className="badge badge-muted" style={{ fontSize: '0.72rem', padding: '2px 8px' }}>
                  {periodLabel}
                </span>
              </>
            )}
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, letterSpacing: '-0.025em' }}>
            {getGreeting()}, <span style={{ color: 'var(--primary)' }}>{userName}</span>
          </h2>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
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
              cursor: 'pointer',
              transition: 'all 0.15s ease'
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

      {/* 2. Main Hero Split: Available Balance & Safe to Spend Today */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', alignItems: 'center', marginBottom: '24px' }}>
        
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

      {/* 3. 4-Pillar Supporting Metrics: Income, Spending, Savings, Savings Rate */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
        gap: '12px',
        paddingTop: '20px',
        borderTop: '1px solid var(--border-color)'
      }}>
        
        {/* Metric 1: Monthly Income */}
        <div style={{ background: '#FAFAF7', padding: '14px 16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
              Monthly Income
            </span>
            <div style={{ width: '22px', height: '22px', borderRadius: '6px', background: 'var(--badge-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ArrowDownLeft size={13} color="var(--primary)" />
            </div>
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '-0.02em' }}>
            +{formatINR(monthlyIncome)}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Salary &amp; Credits
          </div>
        </div>

        {/* Metric 2: Monthly Spending */}
        <div 
          onClick={() => onNavigate && onNavigate('/spending')}
          style={{ 
            background: '#FAFAF7', 
            padding: '14px 16px', 
            borderRadius: '12px', 
            border: '1px solid var(--border-color)',
            cursor: 'pointer',
            transition: 'border-color 0.15s ease'
          }}
          title="Click to view spending breakdown"
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
              Monthly Spending
            </span>
            <div style={{ width: '22px', height: '22px', borderRadius: '6px', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ArrowUpRight size={13} color="var(--text-main)" />
            </div>
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            {formatINR(monthlySpending)}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Total Outflows
          </div>
        </div>

        {/* Metric 3: Monthly Savings */}
        <div style={{ background: '#FAFAF7', padding: '14px 16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
              Monthly Savings
            </span>
            <div style={{ width: '22px', height: '22px', borderRadius: '6px', background: 'var(--badge-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <PiggyBank size={13} color="var(--primary)" />
            </div>
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: monthlySavings > 0 ? 'var(--primary)' : 'var(--text-main)', letterSpacing: '-0.02em' }}>
            {monthlySavings > 0 ? `+${formatINR(monthlySavings)}` : formatINR(0)}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Net Cash Surplus
          </div>
        </div>

        {/* Metric 4: Savings Rate & Comparison */}
        <div style={{ background: '#FAFAF7', padding: '14px 16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
              Savings Rate
            </span>
            <div style={{ width: '22px', height: '22px', borderRadius: '6px', background: 'var(--badge-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Percent size={13} color="var(--primary)" />
            </div>
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '-0.02em' }}>
            {savingsRate}%
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={comparison?.text}>
            {comparison?.text || `${savingsRate}% of income preserved`}
          </div>
        </div>

      </div>

    </div>
  );
}
