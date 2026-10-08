import React, { useState } from 'react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  ShieldAlert, 
  X, 
  Info, 
  Flag, 
  Check, 
  ArrowRight
} from 'lucide-react';
import { formatINR } from '../../utils/formatters.js';

export function AnomalyCard({
  anomaly,
  onMarkReviewed,
  onMarkNormal,
  onReport
}) {
  const [whyOpen, setWhyOpen] = useState(false);

  if (!anomaly) return null;

  const merchant = anomaly.merchant || anomaly.cleanMerchant || anomaly.title || 'Unknown Merchant';
  const amount = Number(anomaly.amount) || 0;
  const date = anomaly.date || '';
  const category = anomaly.category || 'General';
  const usualRange = anomaly.normalRange || '₹200 – ₹800';
  const isDuplicate = anomaly.type === 'DUPLICATE_TRANSACTION' || anomaly.type === 'DUPLICATE';
  const anomalyType = isDuplicate ? 'DUPLICATE CHARGE' : 'UNUSUAL AMOUNT';
  const reasons = anomaly.whyFlagged || [
    anomaly.reason || 'Flagged by statistical outlier detection engine.',
    'Amount is outside your historical transaction baseline'
  ];

  return (
    <div 
      className="glass-card" 
      style={{ 
        padding: '24px 28px', 
        background: '#FFFFFF', 
        border: '1px solid #FDE68A', 
        borderRadius: '18px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}
    >
      {/* Top row: Amount, Anomaly Pill, and Merchant */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <span style={{ fontSize: '1.9rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.03em', lineHeight: 1 }}>
              {formatINR(amount)}
            </span>
            <span className="badge badge-amber" style={{ fontSize: '0.72rem', padding: '3px 8px' }}>
              <AlertTriangle size={12} />
              <span>{anomalyType}</span>
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.86rem', color: 'var(--text-main)', fontWeight: 600 }}>
            <span>{merchant}</span>
            {date && <span style={{ color: 'var(--text-muted)' }}>•</span>}
            <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>{date} {category ? `· ${category}` : ''}</span>
          </div>
        </div>

        {/* Comparison Pill */}
        <div style={{
          background: '#FEF9EE',
          border: '1px solid #FDE68A',
          borderRadius: '12px',
          padding: '10px 16px',
          textAlign: 'right'
        }}>
          <div style={{ fontSize: '0.72rem', color: '#92400E', textTransform: 'uppercase', fontWeight: 700 }}>
            {isDuplicate ? 'Duplicate Notice' : `Normal Range: ${usualRange}`}
          </div>
          <div style={{ fontSize: '0.86rem', color: '#B45309', fontWeight: 700, marginTop: '2px' }}>
            {isDuplicate ? 'Identical charge posted < 24h' : 'Outside typical spending baseline'}
          </div>
        </div>
      </div>

      {/* Flag reason summary */}
      <div style={{
        background: '#FAFAF7',
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '8px'
      }}>
        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          {anomaly.reason || 'Flagged by real-time outlier detection engine.'}
        </div>

        <button 
          type="button"
          onClick={() => setWhyOpen(!whyOpen)}
          className="btn btn-secondary btn-sm"
          style={{ fontSize: '0.74rem', padding: '4px 8px' }}
        >
          <Info size={13} color="var(--primary)" />
          <span>{whyOpen ? 'Hide analysis' : 'Why was this flagged?'}</span>
        </button>
      </div>

      {/* Collapsible Explanations */}
      {whyOpen && (
        <div style={{
          background: '#FFFFFF',
          border: '1px solid #E4E9E3',
          borderRadius: '12px',
          padding: '14px 16px',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '8px' }}>
            Detection Criteria:
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {reasons.map((r, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: 'var(--text-main)' }}>
                <span style={{ color: 'var(--accent-amber)' }}>•</span>
                <span>{r}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons: Review, Mark as Normal, Report */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid var(--border-color)', paddingTop: '14px' }}>
        <button
          type="button"
          onClick={() => onReport ? onReport(anomaly) : alert('Transaction reported for statement verification.')}
          className="btn btn-secondary btn-sm"
          style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}
        >
          <Flag size={13} />
          <span>Report</span>
        </button>

        <button
          type="button"
          onClick={() => onMarkNormal ? onMarkNormal(anomaly) : (onMarkReviewed && onMarkReviewed(anomaly))}
          className="btn btn-secondary btn-sm"
          style={{ fontSize: '0.76rem' }}
        >
          <span>Mark as normal</span>
        </button>

        <button
          type="button"
          onClick={() => onMarkReviewed && onMarkReviewed(anomaly)}
          className="btn btn-primary btn-sm"
          style={{ fontSize: '0.76rem' }}
        >
          <Check size={13} />
          <span>Mark Reviewed</span>
        </button>
      </div>
    </div>
  );
}
