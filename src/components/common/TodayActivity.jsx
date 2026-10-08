import React, { useState } from 'react';
import { 
  Clock, 
  ArrowDownLeft, 
  ArrowUpRight, 
  ChevronRight, 
  Repeat,
  ShoppingBag,
  Utensils,
  Briefcase
} from 'lucide-react';
import { formatINR } from '../../utils/formatters.js';
import { TransactionDrawer } from './TransactionDrawer.jsx';

export function TodayActivity({
  transactions = [],
  onNavigate
}) {
  const [selectedTx, setSelectedTx] = useState(null);

  // Extract recent / today transactions, or provide realistic day stream if dataset dates are varied
  const activityItems = React.useMemo(() => {
    if (transactions && transactions.length > 0) {
      // Pick first 4 transactions representing recent activity
      return transactions.slice(0, 5).map((t, idx) => ({
        ...t,
        id: t.id || `act-${idx}`,
        cleanMerchant: t.cleanMerchant || t.merchant || (t.type === 'CREDIT' ? 'Salary Credit' : 'Payment Outflow')
      }));
    }

    // Default realistic stream matching user prompt specification
    return [
      {
        id: 'today-1',
        date: '2026-10-08',
        time: '09:30 AM',
        cleanMerchant: 'Corporate Salary (Account Credit)',
        category: 'Income',
        amount: 25000,
        type: 'CREDIT',
        paymentMode: 'NEFT Direct Deposit',
        rawNarration: 'NEFT-CORP-PAYROLL-SALARY-CREDIT-OCT2026'
      },
      {
        id: 'today-2',
        date: '2026-10-08',
        time: '11:15 AM',
        cleanMerchant: 'Netflix India',
        category: 'Entertainment',
        amount: 649,
        type: 'DEBIT',
        paymentMode: 'UPI Autopay Mandate',
        rawNarration: 'UPI-NETFLIX-MUMBAI-AUTOPAY-MANDATE-REF9281'
      },
      {
        id: 'today-3',
        date: '2026-10-08',
        time: '01:45 PM',
        cleanMerchant: 'Swiggy Lunch',
        category: 'Food & Dining',
        amount: 280,
        type: 'DEBIT',
        paymentMode: 'UPI Instant',
        rawNarration: 'UPI-SWIGGY-BANGALORE-ORDER-298102'
      },
      {
        id: 'today-4',
        date: '2026-10-08',
        time: '04:20 PM',
        cleanMerchant: 'Amazon India',
        category: 'Shopping',
        amount: 1250,
        type: 'DEBIT',
        paymentMode: 'Debit Card •••• 8102',
        rawNarration: 'CARD-AMAZON PAY INDIA MUMBAI RETAIL'
      }
    ];
  }, [transactions]);

  return (
    <>
      <div 
        className="glass-panel" 
        style={{ 
          padding: '26px 28px', 
          background: '#FFFFFF', 
          border: '1px solid var(--border-color)', 
          borderRadius: '20px' 
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div className="icon-box-mint" style={{ width: '30px', height: '30px', borderRadius: '8px' }}>
                <Clock size={16} color="var(--primary)" />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, letterSpacing: '-0.02em' }}>
                Your Money Today
              </h3>
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: '2px' }}>
              TODAY · OCT 8
            </div>
          </div>

          <button
            onClick={() => onNavigate && onNavigate('/transactions')}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.76rem', padding: '5px 12px' }}
          >
            <span>View All Activity</span>
            <ChevronRight size={13} />
          </button>
        </div>

        {/* Chronological Stream */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {activityItems.map((tx) => {
            const isCredit = tx.type === 'CREDIT' || tx.type === 'income';

            return (
              <div
                key={tx.id}
                onClick={() => setSelectedTx(tx)}
                style={{
                  background: '#FAFAF7',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  transition: 'background 0.15s, border-color 0.15s'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = '#F5F6F2';
                  e.currentTarget.style.borderColor = '#D6E7DC';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = '#FAFAF7';
                  e.currentTarget.style.borderColor = 'var(--border-color)';
                }}
                title="Click to view transaction details"
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
                      color: isCredit ? 'var(--primary)' : 'var(--text-main)'
                    }}
                  >
                    {isCredit ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                  </div>

                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-main)' }}>
                      {tx.cleanMerchant}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      {tx.category || 'General'} {tx.time ? `• ${tx.time}` : ''}
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
                    {isCredit ? '+ ' : '− '}{formatINR(tx.amount)}
                  </div>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                    {isCredit ? 'Credit' : 'Debit'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Transaction Slide-over Drawer */}
      <TransactionDrawer
        transaction={selectedTx}
        isOpen={Boolean(selectedTx)}
        onClose={() => setSelectedTx(null)}
        onNavigate={onNavigate}
      />
    </>
  );
}
