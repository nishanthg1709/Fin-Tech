import React, { useState } from 'react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  RotateCcw, 
  ShieldCheck, 
  Info,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { formatINR } from '../utils/formatters.js';
import { AnomalyCard, EmptyState } from './common/index.js';

export function AnomaliesView({ 
  allAnomalies = [], 
  anomalies = [], 
  reviewedAnomalyIds = [], 
  onMarkReviewed, 
  onUnmarkReviewed 
}) {
  const [localReviewedIds, setLocalReviewedIds] = useState(() => new Set(reviewedAnomalyIds));
  const [toast, setToast] = useState(null);
  const [showHistory, setShowHistory] = useState(false);

  // Synchronize when prop updates
  React.useEffect(() => {
    setLocalReviewedIds(new Set(reviewedAnomalyIds));
  }, [reviewedAnomalyIds]);

  const sourcePool = allAnomalies.length > 0 ? allAnomalies : anomalies;
  const activeList = sourcePool.filter(item => !localReviewedIds.has(item.id));
  const reviewedList = sourcePool.filter(item => localReviewedIds.has(item.id));

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const handleMarkReviewed = (item) => {
    setLocalReviewedIds(prev => new Set([...prev, item.id]));
    if (onMarkReviewed) onMarkReviewed(item.id);
    showToast(`Transaction marked as reviewed.`);
  };

  const handleRestore = (item) => {
    setLocalReviewedIds(prev => {
      const next = new Set(prev);
      next.delete(item.id);
      return next;
    });
    if (onUnmarkReviewed) onUnmarkReviewed(item.id);
    showToast(`Alert restored to active review list.`);
  };

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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
              <div className="icon-box-mint">
                <AlertTriangle size={18} color="var(--accent-amber)" />
              </div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, letterSpacing: '-0.02em' }}>
                Unusual <span style={{ color: 'var(--primary)' }}>Transactions</span> Investigation
              </h2>
            </div>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', margin: 0 }}>
              Statistical outlier detection flagging unusual amount spikes, duplicate charges, and unrecognized transactions.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className={`badge ${activeList.length > 0 ? 'badge-amber' : 'badge-emerald'}`} style={{ fontSize: '0.74rem' }}>
              {activeList.length} Flagged for Review
            </span>
          </div>
        </div>
      </div>

      {/* ACTIVE ANOMALIES LIST */}
      {activeList.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {activeList.map(anomaly => (
            <AnomalyCard
              key={anomaly.id}
              anomaly={anomaly}
              onMarkReviewed={handleMarkReviewed}
              onMarkNormal={handleMarkReviewed}
              onReport={() => showToast('Report submitted for statement verification.')}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={CheckCircle2}
          title="All unusual transactions have been reviewed"
          description="No active suspicious spikes, duplicate debits, or unusual transaction amounts require attention."
          actionText="View All Transactions"
          onAction={() => window.location.pathname = '/transactions'}
        />
      )}

      {/* REVIEWED HISTORY TOGGLE */}
      {reviewedList.length > 0 && (
        <div style={{ marginTop: '8px' }}>
          <button
            type="button"
            onClick={() => setShowHistory(!showHistory)}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem' }}
          >
            <span>{showHistory ? 'Hide' : 'Show'} Reviewed Alerts History ({reviewedList.length})</span>
            {showHistory ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>

          {showHistory && (
            <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {reviewedList.map(item => (
                <div 
                  key={item.id}
                  style={{
                    background: '#FAFAF7',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    padding: '14px 18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    opacity: 0.8
                  }}
                >
                  <div>
                    <strong style={{ fontSize: '0.88rem', color: 'var(--text-main)' }}>
                      {item.merchant || item.title}
                    </strong>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                      {formatINR(item.amount)} · Marked as resolved
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRestore(item)}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '0.74rem', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <RotateCcw size={12} />
                    <span>Restore Alert</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Confirmation Toast */}
      {toast && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '28px',
          zIndex: 9999,
          background: '#203733',
          color: '#FFFFFF',
          padding: '12px 20px',
          borderRadius: '10px',
          fontSize: '0.85rem',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.16)'
        }}>
          <CheckCircle2 size={16} color="#A7F3D0" />
          <span>{toast}</span>
        </div>
      )}

    </div>
  );
}
