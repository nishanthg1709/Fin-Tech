import React, { useState } from 'react';
import { 
  ArrowDownLeft, 
  ArrowUpRight, 
  Calendar, 
  ChevronRight, 
  TrendingUp, 
  TrendingDown,
  Clock,
  Sparkles,
  Info
} from 'lucide-react';
import { formatINR, formatIndianNumber } from '../../utils/formatters.js';

export function CashFlowCard({
  cashFlowData,
  activePeriod = 'THIS_MONTH',
  onPeriodChange,
  onNavigate,
  isLoading = false
}) {
  const [hoveredMonth, setHoveredMonth] = useState(null);

  if (isLoading) {
    return (
      <div className="glass-panel" style={{ padding: '28px', background: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: '20px' }}>
        <div style={{ height: '24px', width: '180px', background: '#F1F5F9', borderRadius: '6px', marginBottom: '16px' }} />
        <div style={{ height: '160px', width: '100%', background: '#F8FAFC', borderRadius: '12px' }} />
      </div>
    );
  }

  const months = cashFlowData?.months || [];
  const current = cashFlowData?.currentMonth || { income: 0, spending: 0, net: 0, savingsRate: 0 };

  const totalPeriodIncome = months.reduce((sum, m) => sum + (m.income || 0), 0) || current.income || 0;
  const totalPeriodSpending = months.reduce((sum, m) => sum + (m.spending || 0), 0) || current.spending || 0;
  const netCashFlow = totalPeriodIncome - totalPeriodSpending;
  const overallSavingsRate = totalPeriodIncome > 0 ? Math.round((Math.max(0, netCashFlow) / totalPeriodIncome) * 100) : 0;

  // Max scale calculation for normalized bar rendering
  const maxBarValue = Math.max(1, totalPeriodIncome, totalPeriodSpending, ...months.map(m => Math.max(m.income, m.spending)));

  return (
    <div 
      className="glass-panel" 
      style={{ 
        padding: '28px 30px', 
        background: '#FFFFFF', 
        border: '1px solid var(--border-color)', 
        borderRadius: '20px' 
      }}
    >
      {/* 1. Header with Period Selector */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px', marginBottom: '22px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="icon-box-mint" style={{ width: '32px', height: '32px', borderRadius: '8px' }}>
              <TrendingUp size={16} color="var(--primary)" />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, letterSpacing: '-0.02em' }}>
              Cash Flow &amp; Net Movement
            </h3>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '3px 0 0 0' }}>
            Inflows vs outflows across billing cycles
          </p>
        </div>

        {/* Time Period Filter Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#F1F5F0', padding: '3px', borderRadius: '10px' }}>
          {[
            { id: 'THIS_MONTH', label: 'This Month' },
            { id: 'LAST_MONTH', label: 'Last Month' },
            { id: 'LAST_3_MONTHS', label: 'Last 3 Months' }
          ].map(p => {
            const isActive = activePeriod === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => onPeriodChange && onPeriodChange(p.id)}
                style={{
                  padding: '5px 12px',
                  fontSize: '0.76rem',
                  fontWeight: isActive ? 700 : 500,
                  borderRadius: '8px',
                  border: 'none',
                  background: isActive ? '#FFFFFF' : 'transparent',
                  color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                  boxShadow: isActive ? '0 1px 4px rgba(0,0,0,0.06)' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Primary 3-Metric Summary Pill Banner */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '24px' }}>
        
        {/* Total Inflow */}
        <div style={{ background: '#FAFAF7', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
            <ArrowDownLeft size={13} color="var(--primary)" />
            <span>Total Inflow</span>
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)', marginTop: '4px' }}>
            +{formatINR(totalPeriodIncome)}
          </div>
        </div>

        {/* Total Outflow */}
        <div style={{ background: '#FAFAF7', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
            <ArrowUpRight size={13} color="var(--text-main)" />
            <span>Total Outflow</span>
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px' }}>
            −{formatINR(totalPeriodSpending)}
          </div>
        </div>

        {/* Net Surplus / Deficit */}
        <div style={{ background: '#FAFAF7', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
            <Sparkles size={13} color={netCashFlow >= 0 ? 'var(--primary)' : 'var(--accent-rose)'} />
            <span>Net Cash Flow</span>
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: netCashFlow >= 0 ? 'var(--primary)' : 'var(--accent-rose)', marginTop: '4px' }}>
            {netCashFlow >= 0 ? `+${formatINR(netCashFlow)}` : formatINR(netCashFlow)}
          </div>
        </div>

      </div>

      {/* 3. Stream Comparison Visualization */}
      <div style={{ marginBottom: '22px' }}>
        <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '10px' }}>
          Flow Proportion
        </div>

        {/* Income Stream */}
        <div style={{ marginBottom: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
            <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>Inflow (Income &amp; Credits)</span>
            <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{formatINR(totalPeriodIncome)}</span>
          </div>
          <div style={{ width: '100%', height: '8px', background: '#E4E9E3', borderRadius: '4px', overflow: 'hidden' }}>
            <div 
              style={{ 
                width: '100%', 
                height: '100%', 
                background: 'var(--primary)', 
                borderRadius: '4px',
                transition: 'width 0.5s ease' 
              }} 
            />
          </div>
        </div>

        {/* Spending Stream */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
            <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>Outflow (Debits &amp; Spending)</span>
            <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>
              {formatINR(totalPeriodSpending)} ({totalPeriodIncome > 0 ? Math.round((totalPeriodSpending / totalPeriodIncome) * 100) : 0}%)
            </span>
          </div>
          <div style={{ width: '100%', height: '8px', background: '#E4E9E3', borderRadius: '4px', overflow: 'hidden' }}>
            <div 
              style={{ 
                width: `${totalPeriodIncome > 0 ? Math.min(100, (totalPeriodSpending / totalPeriodIncome) * 100) : 60}%`, 
                height: '100%', 
                background: '#475569', 
                borderRadius: '4px',
                transition: 'width 0.5s ease' 
              }} 
            />
          </div>
        </div>
      </div>

      {/* 4. Multi-Month Trend Column Cards (if multiple months available) */}
      {months.length > 1 && (
        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '18px', marginBottom: '14px' }}>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '10px' }}>
            Monthly Progression
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${months.length}, 1fr)`, gap: '10px' }}>
            {months.map(m => {
              const net = m.income - m.spending;
              const isPositive = net >= 0;
              return (
                <div 
                  key={m.monthKey}
                  onMouseEnter={() => setHoveredMonth(m.monthKey)}
                  onMouseLeave={() => setHoveredMonth(null)}
                  style={{ 
                    background: hoveredMonth === m.monthKey ? '#F5F6F2' : '#FAFAF7',
                    border: '1px solid var(--border-color)',
                    borderRadius: '10px',
                    padding: '10px 12px',
                    textAlign: 'center',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    {m.shortLabel}
                  </div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: isPositive ? 'var(--primary)' : 'var(--accent-rose)', marginTop: '4px' }}>
                    {isPositive ? `+${formatINR(net)}` : formatINR(net)}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                    {m.savingsRate}% saved
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. Footer Navigation Link to Full Cash Flow Runway View */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '10px' }}>
        <button
          type="button"
          onClick={() => onNavigate && onNavigate('/cash-flow')}
          className="btn btn-secondary btn-sm"
          style={{ fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <span>View 30-Day Runway &amp; Simulator</span>
          <ChevronRight size={14} />
        </button>
      </div>

    </div>
  );
}
