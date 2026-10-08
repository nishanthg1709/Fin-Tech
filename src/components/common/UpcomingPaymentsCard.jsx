import React from 'react';
import { 
  CalendarClock, 
  ChevronRight, 
  Clock, 
  AlertCircle, 
  Repeat,
  Sparkles 
} from 'lucide-react';
import { formatINR } from '../../utils/formatters.js';
import { EmptyState } from './EmptyState.jsx';

export function UpcomingPaymentsCard({
  upcomingPayments,
  onNavigate
}) {
  const items = upcomingPayments?.items || [];
  const totalExpected = upcomingPayments?.totalExpected || 0;

  if (!items || items.length === 0) {
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <div className="icon-box-mint" style={{ width: '32px', height: '32px', borderRadius: '8px' }}>
            <CalendarClock size={16} color="var(--primary)" />
          </div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, letterSpacing: '-0.02em' }}>
            Upcoming Recurring Payments
          </h3>
        </div>
        
        <EmptyState
          icon={CalendarClock}
          title="No upcoming payments detected"
          description="Your transaction history shows no regular recurring bills due in the next 30 days."
          actionText="View Recurring Hub"
          onAction={() => onNavigate && onNavigate('/subscriptions')}
        />
      </div>
    );
  }

  return (
    <div 
      className="glass-panel" 
      style={{ 
        padding: '26px 28px', 
        background: '#FFFFFF', 
        border: '1px solid var(--border-color)', 
        borderRadius: '20px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}
    >
      <div>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div className="icon-box-mint" style={{ width: '32px', height: '32px', borderRadius: '8px' }}>
                <CalendarClock size={16} color="var(--primary)" />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, letterSpacing: '-0.02em' }}>
                Upcoming Recurring Payments
              </h3>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '3px 0 0 0' }}>
              Next expected debits from recurring history
            </p>
          </div>

          <button
            type="button"
            onClick={() => onNavigate && onNavigate('/subscriptions')}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.76rem', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <span>View All</span>
            <ChevronRight size={13} />
          </button>
        </div>

        {/* Upcoming List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
          {items.map((item) => {
            const isDueSoon = item.daysRemaining <= 5;
            return (
              <div
                key={item.id}
                onClick={() => onNavigate && onNavigate('/subscriptions')}
                style={{
                  background: isDueSoon ? '#FFFDF5' : '#FAFAF7',
                  border: isDueSoon ? '1px solid #FDE68A' : '1px solid var(--border-color)',
                  borderRadius: '12px',
                  padding: '12px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  transition: 'background 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: isDueSoon ? '#FEF3C7' : 'var(--badge-bg)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: isDueSoon ? '#D97706' : 'var(--primary)'
                  }}>
                    <Repeat size={15} />
                  </div>

                  <div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)' }}>
                      {item.merchantName}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>Due: {item.expectedDate}</span>
                      <span>•</span>
                      <span>{item.interval}</span>
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.94rem', fontWeight: 800, color: 'var(--text-main)' }}>
                    {formatINR(item.amount)}
                  </div>
                  <span 
                    className={`badge ${isDueSoon ? 'badge-amber' : 'badge-muted'}`}
                    style={{ fontSize: '0.66rem', padding: '1px 6px' }}
                  >
                    In {item.daysRemaining} days
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Info */}
      <div style={{ 
        borderTop: '1px solid var(--border-color)', 
        paddingTop: '12px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        fontSize: '0.76rem',
        color: 'var(--text-muted)'
      }}>
        <span>Expected Next 30 Days: <strong>{formatINR(totalExpected)}</strong></span>
        <span 
          onClick={() => onNavigate && onNavigate('/subscriptions')}
          style={{ color: 'var(--primary)', fontWeight: 600, cursor: 'pointer' }}
        >
          Manage commitments →
        </span>
      </div>

    </div>
  );
}
