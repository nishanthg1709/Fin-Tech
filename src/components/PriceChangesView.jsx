import React, { useState } from 'react';
import { 
  TrendingUp, 
  ArrowRight, 
  Calendar, 
  Repeat, 
  AlertTriangle,
  FileText,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { formatINR } from '../utils/formatters.js';
import { PriceChangeCard, EmptyState } from './common/index.js';

export function PriceChangesView({ 
  priceChanges = [] 
}) {
  const [selectedChange, setSelectedChange] = useState(null);

  // Calculate cumulative annual impact
  const totalAnnualHike = priceChanges.reduce((sum, pc) => sum + (pc.annualImpact || Math.round((pc.newPrice - pc.oldPrice) * 12)), 0);

  if (!priceChanges || priceChanges.length === 0) {
    return (
      <EmptyState
        title="Zero subscription price hikes detected"
        description="All your active recurring services have maintained stable billing amounts without silent rate increases."
        actionText="View Active Subscriptions"
        onAction={() => window.location.pathname = '/subscriptions'}
      />
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      
      {/* Header Panel */}
      <div 
        className="glass-panel" 
        style={{ 
          padding: '26px 28px', 
          background: '#FFFFFF', 
          border: '1px solid var(--border-color)', 
          borderRadius: '20px' 
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
              <div className="icon-box-mint">
                <TrendingUp size={18} color="var(--primary)" />
              </div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, letterSpacing: '-0.02em' }}>
                Subscription <span style={{ color: 'var(--primary)' }}>Price Changes</span>
              </h2>
            </div>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', margin: 0 }}>
              Algorithmic intelligence detecting silent recurring subscription price hikes across billing cycles.
            </p>
          </div>

          <div style={{
            background: '#FFF5F5',
            border: '1px solid #FECDD3',
            borderRadius: '14px',
            padding: '12px 20px',
            textAlign: 'right'
          }}>
            <div style={{ fontSize: '0.7rem', color: '#991B1B', textTransform: 'uppercase', fontWeight: 700 }}>
              Cumulative Annual Rate Hikes
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#BE123C' }}>
              +{formatINR(totalAnnualHike)}<span style={{ fontSize: '0.82rem', fontWeight: 500 }}>/yr</span>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Price Change Cards (Section 9) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {priceChanges.map(change => (
          <PriceChangeCard
            key={change.id}
            change={change}
            onReview={(c) => setSelectedChange(c)}
          />
        ))}
      </div>

      {/* Investigation Details Modal */}
      {selectedChange && (
        <div className="modal-overlay" onClick={() => setSelectedChange(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px', padding: '26px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '8px' }}>
              {selectedChange.merchantName} Rate Hike Analysis
            </h3>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: 1.5 }}>
              Your recurring plan jumped from {formatINR(selectedChange.oldPrice)} to <strong>{formatINR(selectedChange.newPrice)}</strong>. This increases your monthly commitment by {formatINR(selectedChange.newPrice - selectedChange.oldPrice)}/mo and adds <strong>{formatINR(selectedChange.annualImpact || (selectedChange.newPrice - selectedChange.oldPrice) * 12)}</strong> to your annual burn.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button onClick={() => setSelectedChange(null)} className="btn btn-primary btn-sm">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
