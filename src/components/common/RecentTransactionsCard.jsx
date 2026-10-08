import React from 'react';
import { 
  Receipt, 
  ArrowDownLeft, 
  ArrowUpRight, 
  ChevronRight,
  Clock 
} from 'lucide-react';
import { formatINR } from '../../utils/formatters.js';

export function RecentTransactionsCard({
  transactions = [],
  onSelectTransaction,
  onNavigate
}) {
  return (
    <div 
      className="glass-panel" 
      style={{ 
        padding: '26px 28px', 
        background: '#FFFFFF', 
        border: '1px solid var(--border-color)', 
        borderRadius: '20px' 
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="icon-box-mint" style={{ width: '32px', height: '32px', borderRadius: '8px' }}>
              <Receipt size={16} color="var(--primary)" />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, letterSpacing: '-0.02em' }}>
              Recent Transactions
            </h3>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '3px 0 0 0' }}>
            Latest records across your connected bank statements
          </p>
        </div>

        <button
          type="button"
          onClick={() => onNavigate && onNavigate('/transactions')}
          className="btn btn-secondary btn-sm"
          style={{ fontSize: '0.76rem', display: 'flex', alignItems: 'center', gap: '4px' }}
        >
          <span>View All Transactions</span>
          <ChevronRight size={13} />
        </button>
      </div>

      {/* Transactions List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {transactions.slice(0, 6).map((tx) => {
          const isCredit = tx.isCredit !== undefined 
            ? tx.isCredit 
            : (tx.type === 'CREDIT' || tx.type === 'income' || tx.canonical_type === 'income');
          
          const merchantName = tx.displayMerchant || tx.cleanMerchant || tx.merchant || 'Unknown Merchant';
          
          let dateStr = tx.date;
          try {
            const d = new Date(tx.date);
            dateStr = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
          } catch {}

          return (
            <div
              key={tx.id || Math.random()}
              onClick={() => onSelectTransaction && onSelectTransaction(tx)}
              style={{
                background: '#FAFAF7',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                transition: 'background 0.15s ease, border-color 0.15s ease'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = '#F5F6F2';
                e.currentTarget.style.borderColor = '#D6E7DC';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = '#FAFAF7';
                e.currentTarget.style.borderColor = 'var(--border-color)';
              }}
              title="Click to open slide-over transaction drawer"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div 
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: isCredit ? 'var(--badge-bg)' : '#F0F2EF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: isCredit ? 'var(--primary)' : 'var(--text-main)',
                    flexShrink: 0
                  }}
                >
                  {isCredit ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                </div>

                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-main)' }}>
                    {merchantName}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>{tx.category || 'General'}</span>
                    <span>•</span>
                    <span>{dateStr}</span>
                  </div>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{
                  fontWeight: 800,
                  fontSize: '0.98rem',
                  color: isCredit ? 'var(--primary)' : 'var(--text-main)',
                  letterSpacing: '-0.02em'
                }}>
                  {isCredit ? `+${formatINR(tx.amount)}` : `−${formatINR(tx.amount)}`}
                </div>
                <span 
                  className={`badge ${isCredit ? 'badge-emerald' : 'badge-muted'}`}
                  style={{ fontSize: '0.64rem', padding: '1px 6px', textTransform: 'capitalize' }}
                >
                  {isCredit ? 'Credit (Income)' : 'Debit (Expense)'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
