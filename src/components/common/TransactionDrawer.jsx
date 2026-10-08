import React from 'react';
import { 
  X, 
  Receipt, 
  CreditCard, 
  Repeat, 
  Calendar, 
  Tag, 
  Hash, 
  Building2, 
  ExternalLink,
  ShieldCheck,
  ArrowUpRight,
  ArrowDownLeft
} from 'lucide-react';
import { formatINR } from '../../utils/formatters.js';

export function TransactionDrawer({
  transaction,
  isOpen = false,
  onClose,
  onNavigate,
  isReviewed = false,
  onToggleReviewed
}) {
  if (!isOpen || !transaction) return null;

  const isCredit = transaction.type === 'CREDIT' || transaction.type === 'income';
  const cleanMerchant = transaction.cleanMerchant || transaction.merchant || 'Unknown Merchant';
  const rawNarration = transaction.rawNarration || transaction.raw || transaction.description || 'N/A';

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        justifyContent: 'flex-end',
        background: 'rgba(32, 55, 51, 0.45)',
        animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={onClose}
    >
      <div 
        style={{
          width: '100%',
          maxWidth: '460px',
          height: '100vh',
          background: '#FFFFFF',
          borderLeft: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-modal)',
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideInRight 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          overflowY: 'auto'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div style={{
          padding: '22px 26px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="icon-box-mint" style={{ width: '34px', height: '34px', borderRadius: '8px' }}>
              <Receipt size={17} color="var(--primary)" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, letterSpacing: '-0.01em' }}>
                Transaction Details
              </h3>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Settled statement entry
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="btn btn-secondary btn-sm"
            style={{ borderRadius: '50%', width: '30px', height: '30px', padding: 0 }}
            title="Close drawer"
          >
            <X size={15} />
          </button>
        </div>

        {/* Hero Amount Display */}
        <div style={{
          padding: '26px',
          background: '#FAFAF7',
          borderBottom: '1px solid var(--border-color)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em', marginBottom: '4px' }}>
            {isCredit ? 'Credit (Deposit)' : 'Debit (Expense)'}
          </div>
          <div style={{ 
            fontSize: '2.2rem', 
            fontWeight: 800, 
            color: isCredit ? 'var(--primary)' : 'var(--text-main)',
            letterSpacing: '-0.03em',
            lineHeight: 1.15
          }}>
            {isCredit ? '+' : '−'} {formatINR(transaction.amount)}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '10px' }}>
            <span className={`badge ${isCredit ? 'badge-emerald' : 'badge-muted'}`} style={{ fontSize: '0.72rem' }}>
              {transaction.category || 'General'}
            </span>
            {transaction.paymentMode && (
              <span className="badge badge-muted" style={{ fontSize: '0.72rem' }}>
                {transaction.paymentMode}
              </span>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div style={{ padding: '24px 26px', display: 'flex', flexDirection: 'column', gap: '18px', flex: 1 }}>
          
          {/* Merchant Info */}
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em', marginBottom: '6px' }}>
              Normalized Merchant
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#FAFAF7', padding: '12px 14px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
              <div className="icon-box-mint" style={{ width: '32px', height: '32px', borderRadius: '8px', fontWeight: 800 }}>
                {cleanMerchant.charAt(0)}
              </div>
              <strong style={{ fontSize: '0.96rem', color: 'var(--text-main)' }}>
                {cleanMerchant}
              </strong>
            </div>
          </div>

          {/* Raw Statement Narration */}
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em', marginBottom: '6px' }}>
              Original Statement Narration
            </div>
            <div style={{
              background: '#FAFAF7',
              border: '1px solid var(--border-color)',
              borderRadius: '10px',
              padding: '12px 14px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.76rem',
              color: 'var(--text-main)',
              wordBreak: 'break-all',
              lineHeight: 1.45
            }}>
              {rawNarration}
            </div>
          </div>

          {/* Metadata Key-Value Grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.82rem' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', background: '#FAFAF7', borderRadius: '8px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Transaction Date:</span>
              <strong style={{ color: 'var(--text-main)' }}>{transaction.date}</strong>
            </div>

            {transaction.transactionId && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', background: '#FAFAF7', borderRadius: '8px' }}>
                <span style={{ color: 'var(--text-muted)' }}>UTR / Reference ID:</span>
                <strong style={{ color: 'var(--text-main)', fontFamily: 'var(--font-mono)', fontSize: '0.76rem' }}>
                  {transaction.transactionId}
                </strong>
              </div>
            )}

            {transaction.balance !== undefined && transaction.balance !== null && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', background: '#FAFAF7', borderRadius: '8px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Account Balance After:</span>
                <strong style={{ color: 'var(--text-main)' }}>
                  {formatINR(transaction.balance)}
                </strong>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', background: '#FAFAF7', borderRadius: '8px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Data Source:</span>
              <strong style={{ color: 'var(--text-main)' }}>
                Bank Statement CSV
              </strong>
            </div>

          </div>

          {/* Related Recurring Subscription indicator if recurring */}
          {transaction.isRecurring && (
            <div style={{
              background: 'var(--badge-bg)',
              border: '1px solid #D6E7DC',
              borderRadius: '12px',
              padding: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Repeat size={16} color="var(--primary)" />
                <div>
                  <strong style={{ fontSize: '0.84rem', color: 'var(--text-main)', display: 'block' }}>
                    Active Recurring Subscription
                  </strong>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                    Tracked on Subscriptions timeline
                  </span>
                </div>
              </div>

              {onNavigate && (
                <button
                  onClick={() => {
                    onClose();
                    onNavigate('/subscriptions');
                  }}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.72rem', padding: '4px 8px' }}
                >
                  <span>View →</span>
                </button>
              )}
            </div>
          )}

        </div>

        {/* Drawer Footer */}
        <div style={{
          padding: '18px 26px',
          borderTop: '1px solid var(--border-color)',
          background: '#FAFAF7',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px'
        }}>
          {onToggleReviewed ? (
            <button
              onClick={() => onToggleReviewed(transaction)}
              className={`btn ${isReviewed ? 'btn-secondary' : 'btn-primary'} btn-sm`}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <ShieldCheck size={14} color={isReviewed ? 'var(--primary)' : '#FFFFFF'} />
              <span>{isReviewed ? 'Reviewed ✓' : 'Mark as Reviewed'}</span>
            </button>
          ) : <div />}

          <button onClick={onClose} className="btn btn-secondary btn-sm">
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
