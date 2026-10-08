import React, { useState } from 'react';
import { 
  Calendar, 
  Wallet, 
  Clock, 
  Repeat, 
  ShieldCheck, 
  ArrowRight,
  TrendingDown,
  Layers
} from 'lucide-react';
import { formatINR } from '../utils/formatters.js';
import { FinancialRunway, EmptyState } from './common/index.js';

export function CashFlowView({ 
  subscriptions = [], 
  currentBalance = 78450.0 
}) {
  if (!subscriptions || subscriptions.length === 0) {
    return (
      <EmptyState
        title="No recurring subscriptions detected for cash-flow projection"
        description="Upload a bank statement CSV to analyze recurring billing cycles and forecast your 47-day financial runway."
        actionText="Upload Statement CSV"
        onAction={() => window.location.pathname = '/upload-transactions'}
      />
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '26px' }}>
      
      {/* Page Title Header */}
      <div 
        className="glass-panel" 
        style={{ 
          padding: '26px 28px', 
          background: '#FFFFFF', 
          border: '1px solid var(--border-color)', 
          borderRadius: '20px' 
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
              <div className="icon-box-mint">
                <Calendar size={18} color="var(--primary)" />
              </div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, letterSpacing: '-0.02em' }}>
                Financial <span style={{ color: 'var(--primary)' }}>Runway</span> &amp; Cash Flow
              </h2>
            </div>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', margin: 0 }}>
              Interactive liquidity simulation modeling your balance runway, upcoming auto-debit deductions, and safe-to-spend cushion.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="badge badge-emerald" style={{ fontSize: '0.74rem' }}>
              Dynamic Simulation Active
            </span>
          </div>
        </div>
      </div>

      {/* SIGNATURE FINANCIAL RUNWAY COMPONENT */}
      <FinancialRunway
        subscriptions={subscriptions}
        currentBalance={currentBalance}
      />

      {/* UPCOMING RECURRING DEDUCTIONS SCHEDULE */}
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
              Scheduled Recurring Deductions
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
              Chronological auto-debits scheduled to deduct from your account balance
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
                <th style={{ padding: '12px 18px', fontWeight: 600 }}>NEXT DUE DATE</th>
                <th style={{ padding: '12px 18px', fontWeight: 600, textAlign: 'right' }}>RECURRING AMOUNT</th>
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
                  <td style={{ padding: '13px 18px', color: 'var(--text-muted)' }}>
                    {sub.lastBillingDate ? `Next cycle (${sub.interval})` : 'Within 30 days'}
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

    </div>
  );
}
