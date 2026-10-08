import React from 'react';
import { 
  TrendingUp, 
  ArrowRight, 
  Calendar, 
  Repeat, 
  AlertTriangle,
  FileText
} from 'lucide-react';
import { formatINR } from '../../utils/formatters.js';

export function PriceChangeCard({
  change,
  onReview
}) {
  if (!change) return null;

  const oldPrice = change.oldPrice || 499;
  const newPrice = change.newPrice || 649;
  const pctChange = change.percentageChange || 30.1;
  const annualImpact = change.annualImpact || Math.round((newPrice - oldPrice) * 12);
  const merchantName = change.merchantName || 'Subscription';
  const effectiveDate = change.effectiveDate || change.detectedDate || 'Recent billing cycle';

  return (
    <div 
      className="glass-card" 
      style={{ 
        padding: '24px 28px', 
        background: '#FFFFFF', 
        border: '1px solid var(--border-color)', 
        borderRadius: '18px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}
    >
      {/* Top row: Merchant & Percentage increase */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="icon-box-mint" style={{ width: '40px', height: '40px', borderRadius: '10px', fontSize: '1rem', fontWeight: 800 }}>
            {merchantName.charAt(0)}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, letterSpacing: '-0.01em' }}>
                {merchantName}
              </h3>
              <span className="badge badge-rose" style={{ fontSize: '0.72rem', padding: '2px 8px' }}>
                +{pctChange}%
              </span>
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Cadence: {change.interval || '1 Month'} • Detected: {effectiveDate}
            </div>
          </div>
        </div>

        {/* Visual Old Price -> New Price Pill */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          background: '#FAFAF7',
          padding: '8px 16px',
          borderRadius: '12px',
          border: '1px solid var(--border-color)'
        }}>
          <span style={{ color: 'var(--text-muted)', textDecoration: 'line-through', fontSize: '0.92rem' }}>
            {formatINR(oldPrice)}
          </span>
          <ArrowRight size={15} color="var(--accent-rose)" />
          <strong style={{ color: 'var(--text-main)', fontSize: '1.15rem' }}>
            {formatINR(newPrice)}
          </strong>
        </div>
      </div>

      {/* Annual impact callout banner */}
      <div style={{
        background: '#FFF5F5',
        border: '1px solid #FED7D7',
        borderRadius: '12px',
        padding: '14px 18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <TrendingUp size={16} color="var(--accent-rose)" />
          <span style={{ fontSize: '0.84rem', color: '#991B1B', fontWeight: 600 }}>
            This change will cost you approximately <strong>{formatINR(annualImpact)}</strong> more per year.
          </span>
        </div>

        {onReview && (
          <button 
            type="button"
            onClick={() => onReview(change)}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.74rem', padding: '4px 10px', borderColor: '#FECDD3', color: '#991B1B' }}
          >
            Investigate Impact
          </button>
        )}
      </div>
    </div>
  );
}
