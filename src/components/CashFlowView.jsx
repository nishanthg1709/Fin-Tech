import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  Wallet, 
  Clock, 
  Repeat, 
  ShieldCheck, 
  ArrowRight,
  TrendingDown,
  TrendingUp,
  ArrowDownRight,
  ArrowUpRight,
  Layers,
  ChevronRight
} from 'lucide-react';
import { formatINR } from '../utils/formatters.js';
import { FinancialRunway, EmptyState } from './common/index.js';

export function CashFlowView({ 
  subscriptions = [], 
  currentBalance = 78450.0,
  transactions = [],
  summary = null,
  onNavigate
}) {
  const [selectedPeriod, setSelectedPeriod] = useState('THIS_MONTH'); // THIS_MONTH, LAST_MONTH, LAST_3_MONTHS, ALL

  const now = useMemo(() => new Date(), []);
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  // Multi-month aggregated cash flow history
  const monthlyCashFlowHistory = useMemo(() => {
    if (!transactions || transactions.length === 0) return [];

    const map = {};
    transactions.forEach(t => {
      if (!t.date) return;
      const key = t.date.substring(0, 7); // YYYY-MM
      if (!map[key]) {
        map[key] = { key, income: 0, spending: 0, count: 0 };
      }
      const amt = Number(t.amount) || 0;
      if (t.type === 'CREDIT' || t.type === 'income' || t.canonical_type === 'income') {
        map[key].income += amt;
      } else if (t.type !== 'transfer') {
        map[key].spending += amt;
      }
      map[key].count += 1;
    });

    return Object.values(map)
      .sort((a, b) => b.key.localeCompare(a.key))
      .map(m => {
        const [y, mon] = m.key.split('-');
        const d = new Date(Number(y), Number(mon) - 1, 1);
        const label = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        return {
          ...m,
          label,
          net: m.income - m.spending
        };
      });
  }, [transactions]);

  // Filter transactions for active period
  const activeTransactions = useMemo(() => {
    if (!transactions || transactions.length === 0) return [];
    if (selectedPeriod === 'ALL') return transactions;

    return transactions.filter(t => {
      if (!t.date) return false;
      const d = new Date(t.date);
      if (isNaN(d.getTime())) return false;
      const y = d.getFullYear();
      const m = d.getMonth();

      if (selectedPeriod === 'THIS_MONTH') {
        return y === currentYear && m === currentMonth;
      }
      if (selectedPeriod === 'LAST_MONTH') {
        const targetM = currentMonth === 0 ? 11 : currentMonth - 1;
        const targetY = currentMonth === 0 ? currentYear - 1 : currentYear;
        return y === targetY && m === targetM;
      }
      if (selectedPeriod === 'LAST_3_MONTHS') {
        const diff = (currentYear - y) * 12 + (currentMonth - m);
        return diff >= 0 && diff < 3;
      }
      return true;
    });
  }, [transactions, selectedPeriod, currentYear, currentMonth]);

  // Compute metrics for active period (falling back to statement totals if month is empty)
  const periodMetrics = useMemo(() => {
    const txSource = activeTransactions.length > 0 ? activeTransactions : transactions;
    let income = 0;
    let spending = 0;

    txSource.forEach(t => {
      const amt = Number(t.amount) || 0;
      if (t.type === 'CREDIT' || t.type === 'income' || t.canonical_type === 'income') {
        income += amt;
      } else if (t.type !== 'transfer') {
        spending += amt;
      }
    });

    const net = income - spending;
    const savingsRate = income > 0 ? Math.round((net / income) * 100) : 0;

    return {
      income,
      spending,
      net,
      savingsRate,
      count: txSource.length
    };
  }, [activeTransactions, transactions]);

  if ((!transactions || transactions.length === 0) && (!subscriptions || subscriptions.length === 0)) {
    return (
      <EmptyState
        icon={Calendar}
        title="No cash-flow data detected"
        description="Upload a bank statement CSV to forecast your inflows, outflows, and financial runway."
        actionText="Upload Statement CSV"
        onAction={() => onNavigate ? onNavigate('/upload-transactions') : (window.location.pathname = '/upload-transactions')}
      />
    );
  }

  const maxFlow = Math.max(periodMetrics.income, periodMetrics.spending, 1);
  const incomePct = Math.round((periodMetrics.income / maxFlow) * 100);
  const spendingPct = Math.round((periodMetrics.spending / maxFlow) * 100);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '26px' }}>
      
      {/* 1. PAGE HEADER WITH TIME PERIOD SELECTOR */}
      <div 
        className="glass-panel" 
        style={{ 
          padding: '24px 28px', 
          background: '#FFFFFF', 
          border: '1px solid var(--border-color)', 
          borderRadius: '20px' 
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
              <div className="icon-box-mint">
                <Calendar size={18} color="var(--primary)" />
              </div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, letterSpacing: '-0.02em' }}>
                Cash Flow &amp; <span style={{ color: 'var(--primary)' }}>Runway Intelligence</span>
              </h2>
            </div>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', margin: 0 }}>
              Real-time liquidity analysis measuring total income inflows vs debit outflows and projected safe runway.
            </p>
          </div>

          {/* Period Selector Tabs */}
          <div style={{ display: 'flex', alignItems: 'center', background: '#FAFAF7', padding: '4px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
            {[
              { id: 'THIS_MONTH', label: 'This Month' },
              { id: 'LAST_MONTH', label: 'Last Month' },
              { id: 'LAST_3_MONTHS', label: 'Last 3 Months' },
              { id: 'ALL', label: 'All Statements' }
            ].map(p => (
              <button
                key={p.id}
                onClick={() => setSelectedPeriod(p.id)}
                className={`btn btn-sm ${selectedPeriod === p.id ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.74rem', padding: '5px 12px', border: selectedPeriod === p.id ? 'none' : 'transparent' }}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. THREE KEY METRIC TILES */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '16px'
      }}>
        {/* Metric 1: Total Inflow */}
        <div className="glass-card" style={{ padding: '22px', background: '#FFFFFF' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>
              Income Inflow
            </span>
            <div className="icon-box-mint" style={{ width: '28px', height: '28px', borderRadius: '6px' }}>
              <ArrowUpRight size={15} color="var(--primary)" />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '4px' }}>
            +{formatINR(periodMetrics.income)}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Salary, bank credits &amp; deposits
          </div>
        </div>

        {/* Metric 2: Total Outflow */}
        <div className="glass-card" style={{ padding: '22px', background: '#FFFFFF' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>
              Total Outflow
            </span>
            <div className="icon-box-mint" style={{ width: '28px', height: '28px', borderRadius: '6px' }}>
              <ArrowDownRight size={15} color="var(--text-main)" />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px' }}>
            -{formatINR(periodMetrics.spending)}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Debits, mandates &amp; payments
          </div>
        </div>

        {/* Metric 3: Net Cash Flow */}
        <div className="glass-card" style={{ padding: '22px', background: '#FFFFFF' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>
              Net Cash Flow
            </span>
            <span className={`badge ${periodMetrics.net >= 0 ? 'badge-emerald' : 'badge-rose'}`} style={{ fontSize: '0.68rem' }}>
              {periodMetrics.net >= 0 ? `${periodMetrics.savingsRate}% Surplus` : 'Deficit'}
            </span>
          </div>
          <div style={{ 
            fontSize: '1.75rem', 
            fontWeight: 800, 
            color: periodMetrics.net >= 0 ? 'var(--primary)' : 'var(--accent-rose)', 
            marginBottom: '4px' 
          }}>
            {periodMetrics.net >= 0 ? '+' : ''}{formatINR(periodMetrics.net)}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            {periodMetrics.net >= 0 ? 'Liquid savings retained' : 'Outflows exceeded income'}
          </div>
        </div>
      </div>

      {/* 3. VISUAL INFLOW VS OUTFLOW DYNAMICS */}
      <div className="glass-panel" style={{ padding: '24px 28px', background: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: '18px' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 16px 0', letterSpacing: '-0.02em' }}>
          Flow Comparison &amp; Distribution
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Income Bar */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.84rem' }}>
              <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>Total Inflow (Income)</span>
              <strong style={{ color: 'var(--primary)' }}>+{formatINR(periodMetrics.income)}</strong>
            </div>
            <div style={{ width: '100%', height: '10px', background: '#E4E9E3', borderRadius: '6px', overflow: 'hidden' }}>
              <div style={{
                width: `${incomePct}%`,
                height: '100%',
                background: 'var(--primary)',
                borderRadius: '6px',
                transition: 'width 0.4s ease'
              }} />
            </div>
          </div>

          {/* Spending Bar */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.84rem' }}>
              <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>Total Outflow (Spending)</span>
              <strong style={{ color: 'var(--text-main)' }}>-{formatINR(periodMetrics.spending)}</strong>
            </div>
            <div style={{ width: '100%', height: '10px', background: '#E4E9E3', borderRadius: '6px', overflow: 'hidden' }}>
              <div style={{
                width: `${spendingPct}%`,
                height: '100%',
                background: '#E06D53',
                borderRadius: '6px',
                transition: 'width 0.4s ease'
              }} />
            </div>
          </div>
        </div>
      </div>

      {/* 4. MULTI-MONTH TREND BAR (IF DATA AVAILABLE) */}
      {monthlyCashFlowHistory.length > 0 && (
        <div className="glass-panel" style={{ padding: '24px 28px', background: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, letterSpacing: '-0.02em' }}>
              Historical Cash Flow Trajectory
            </h3>
            <span className="badge badge-emerald" style={{ fontSize: '0.74rem' }}>
              {monthlyCashFlowHistory.length} Months Tracked
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
            {monthlyCashFlowHistory.map((m, idx) => (
              <div key={idx} style={{ background: '#FAFAF7', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px' }}>
                <strong style={{ fontSize: '0.92rem', color: 'var(--text-main)', display: 'block', marginBottom: '6px' }}>
                  {m.label}
                </strong>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                  <span>Inflow:</span>
                  <span style={{ color: 'var(--primary)', fontWeight: 600 }}>+{formatINR(m.income)}</span>
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span>Outflow:</span>
                  <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>-{formatINR(m.spending)}</span>
                </div>
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '6px', display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>Net Movement:</span>
                  <strong style={{ color: m.net >= 0 ? 'var(--primary)' : 'var(--accent-rose)' }}>
                    {m.net >= 0 ? '+' : ''}{formatINR(m.net)}
                  </strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. SIGNATURE FINANCIAL RUNWAY COMPONENT */}
      <FinancialRunway
        subscriptions={subscriptions}
        currentBalance={currentBalance}
      />

      {/* 6. UPCOMING RECURRING DEDUCTIONS SCHEDULE */}
      {subscriptions.length > 0 && (
        <div 
          className="glass-panel" 
          style={{ 
            padding: '24px 28px', 
            background: '#FFFFFF', 
            border: '1px solid var(--border-color)', 
            borderRadius: '20px' 
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, letterSpacing: '-0.02em' }}>
                Scheduled Expected Deductions
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                Estimated recurring commitments scheduled across current billing cadence
              </p>
            </div>

            <span className="badge badge-muted" style={{ fontSize: '0.72rem' }}>
              {subscriptions.length} recurring mandates
            </span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
              <thead>
                <tr style={{ background: '#FAFAF7', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '12px 18px', fontWeight: 600 }}>MERCHANT</th>
                  <th style={{ padding: '12px 18px', fontWeight: 600 }}>CATEGORY</th>
                  <th style={{ padding: '12px 18px', fontWeight: 600 }}>CADENCE</th>
                  <th style={{ padding: '12px 18px', fontWeight: 600 }}>STATUS</th>
                  <th style={{ padding: '12px 18px', fontWeight: 600, textAlign: 'right' }}>EXPECTED AMOUNT</th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.map(sub => (
                  <tr 
                    key={sub.id} 
                    style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#F5F6F2'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '13px 18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div className="icon-box-mint" style={{ width: '30px', height: '30px', borderRadius: '8px', fontSize: '0.76rem', fontWeight: 700 }}>
                          {sub.merchantName.charAt(0)}
                        </div>
                        <strong style={{ color: 'var(--text-main)' }}>{sub.merchantName}</strong>
                      </div>
                    </td>
                    <td style={{ padding: '13px 18px' }}>
                      <span className="badge badge-muted" style={{ fontSize: '0.7rem' }}>
                        {sub.category}
                      </span>
                    </td>
                    <td style={{ padding: '13px 18px' }}>
                      <span className="badge badge-emerald" style={{ fontSize: '0.7rem' }}>
                        {sub.interval}
                      </span>
                    </td>
                    <td style={{ padding: '13px 18px' }}>
                      <span className="badge badge-muted" style={{ fontSize: '0.68rem' }}>
                        Expected Next Cycle
                      </span>
                    </td>
                    <td style={{ padding: '13px 18px', textAlign: 'right', fontWeight: 700, color: 'var(--text-main)' }}>
                      {formatINR(sub.currentPrice)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
