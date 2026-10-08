import React, { useState } from 'react';
import { 
  Repeat, 
  Calendar, 
  TrendingUp, 
  X, 
  FileText, 
  HelpCircle, 
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { formatINR } from '../../utils/formatters.js';

export function SubscriptionTimeline({
  subscriptions = [],
  priceChanges = [],
  onSelectSubscription
}) {
  const [selectedSub, setSelectedSub] = useState(null);

  // Derive chronological dates from actual transaction history
  const timelineNodes = React.useMemo(() => {
    return subscriptions.slice(0, 8).map((sub) => {
      const targetDate = sub.nextEstimatedDate ? new Date(sub.nextEstimatedDate) : new Date(sub.lastBillingDate);
      const day = isNaN(targetDate.getTime()) ? 1 : targetDate.getDate();
      const monthNames = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
      const monthStr = isNaN(targetDate.getTime()) ? 'OCTOBER' : monthNames[targetDate.getMonth()];
      return {
        ...sub,
        timelineDay: String(day).padStart(2, '0'),
        timelineMonth: monthStr,
        priceChange: priceChanges.find(pc => pc.subscriptionId === sub.id)
      };
    }).sort((a, b) => Number(a.timelineDay) - Number(b.timelineDay));
  }, [subscriptions, priceChanges]);

  const handleOpenPanel = (sub) => {
    setSelectedSub(sub);
    if (onSelectSubscription) onSelectSubscription(sub);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* TIMELINE VISUAL CARD */}
      <div 
        className="glass-panel" 
        style={{ 
          padding: '28px', 
          background: '#FFFFFF', 
          border: '1px solid var(--border-color)', 
          borderRadius: '20px',
          overflowX: 'auto'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.06em' }}>
              PAYMENT TIMELINE · OCTOBER 2026
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', margin: '2px 0 0 0', letterSpacing: '-0.02em' }}>
              Recurring Schedule
            </h3>
          </div>
          <span className="badge badge-emerald" style={{ fontSize: '0.72rem' }}>
            {timelineNodes.length} Renewals Scheduled
          </span>
        </div>

        {/* Visual Timeline Track */}
        <div style={{ minWidth: '640px', padding: '10px 0 20px 0' }}>
          
          {/* Month Header Line */}
          <div style={{ position: 'relative', height: '2px', background: '#E4E9E3', margin: '36px 20px 48px 20px' }}>
            {timelineNodes.map((item, idx) => {
              const leftPercent = (idx / (Math.max(1, timelineNodes.length - 1))) * 100;
              const hasHike = Boolean(item.priceChange);

              return (
                <div 
                  key={item.id}
                  onClick={() => handleOpenPanel(item)}
                  style={{
                    position: 'absolute',
                    left: `${leftPercent}%`,
                    top: '-6px',
                    transform: 'translateX(-50%)',
                    cursor: 'pointer',
                    textAlign: 'center'
                  }}
                >
                  {/* Day Label above node */}
                  <div style={{
                    position: 'absolute',
                    top: '-26px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    color: item.timelineDay === '08' ? 'var(--primary)' : 'var(--text-main)',
                    fontFamily: 'var(--font-mono)'
                  }}>
                    {item.timelineDay}
                  </div>

                  {/* Vertical stem */}
                  <div style={{
                    position: 'absolute',
                    top: '-12px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '1.5px',
                    height: '10px',
                    background: item.timelineDay === '08' ? 'var(--primary)' : '#CCD6CA'
                  }} />

                  {/* Circle dot node */}
                  <div 
                    style={{
                      width: '14px',
                      height: '14px',
                      borderRadius: '50%',
                      background: hasHike ? 'var(--accent-rose)' : 'var(--primary)',
                      border: '3px solid #FFFFFF',
                      boxShadow: '0 0 0 1.5px #D6E7DC',
                      transition: 'transform 0.15s',
                      margin: '0 auto'
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.3)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                  />

                  {/* Merchant & Price below node */}
                  <div style={{
                    marginTop: '12px',
                    width: '100px',
                    marginLeft: '-43px'
                  }}>
                    <strong style={{ fontSize: '0.84rem', color: 'var(--text-main)', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.merchantName}
                    </strong>
                    <div style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '2px' }}>
                      {formatINR(item.currentPrice)}
                    </div>
                    {hasHike && (
                      <span className="badge badge-rose" style={{ fontSize: '0.62rem', padding: '1px 5px', marginTop: '3px' }}>
                        +{item.priceChange.percentageChange}%
                      </span>
                    )}
                  </div>

                </div>
              );
            })}
          </div>

        </div>
      </div>

      {/* DETAILED SUBSCRIPTION SLIDE-OVER MODAL / PANEL */}
      {selectedSub && (
        <div className="modal-overlay" onClick={() => setSelectedSub(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px', padding: '26px' }}>
            
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div className="icon-box-mint" style={{ width: '42px', height: '42px', borderRadius: '10px', fontSize: '1rem', fontWeight: 800 }}>
                  {selectedSub.merchantName.charAt(0)}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.2rem', color: 'var(--text-main)', margin: 0, fontWeight: 800 }}>
                    {selectedSub.merchantName}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px' }}>
                    <span className="badge badge-emerald" style={{ fontSize: '0.68rem' }}>
                      {selectedSub.interval} Cadence
                    </span>
                    <span className="badge badge-muted" style={{ fontSize: '0.68rem' }}>
                      {selectedSub.category}
                    </span>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setSelectedSub(null)} 
                className="btn btn-secondary btn-sm" 
                style={{ borderRadius: '50%', width: '28px', height: '28px', padding: 0 }}
              >
                <X size={14} />
              </button>
            </div>

            {/* Price Callout */}
            <div style={{
              background: '#FAFAF7',
              border: '1px solid var(--border-color)',
              borderRadius: '14px',
              padding: '16px',
              marginBottom: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                  Current Price
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  {formatINR(selectedSub.currentPrice)}
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                  Annual Cost
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary)' }}>
                  {formatINR(selectedSub.annualCost || selectedSub.currentPrice * 12)}/yr
                </div>
              </div>
            </div>

            {/* Price History if available */}
            {selectedSub.priceChange && (
              <div style={{
                background: '#FFF5F5',
                border: '1px solid #FED7D7',
                borderRadius: '12px',
                padding: '12px 14px',
                marginBottom: '16px',
                fontSize: '0.82rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#991B1B', fontWeight: 700, marginBottom: '2px' }}>
                  <TrendingUp size={14} />
                  <span>Price Hike Detected</span>
                </div>
                <div style={{ color: 'var(--text-muted)' }}>
                  Previous price was <span style={{ textDecoration: 'line-through' }}>{formatINR(selectedSub.priceChange.oldPrice)}</span> → now <strong>{formatINR(selectedSub.priceChange.newPrice)}</strong> (+{selectedSub.priceChange.percentageChange}% increase).
                </div>
              </div>
            )}

            {/* Subscription Key Metrics */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.82rem', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#FAFAF7', borderRadius: '8px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Billing Cycle:</span>
                <strong style={{ color: 'var(--text-main)' }}>{selectedSub.interval}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#FAFAF7', borderRadius: '8px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Next Payment Due:</span>
                <strong style={{ color: 'var(--primary)' }}>
                  October {selectedSub.timelineDay || '12'}, 2026
                </strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#FAFAF7', borderRadius: '8px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Last Billed Date:</span>
                <strong style={{ color: 'var(--text-main)' }}>{selectedSub.lastBillingDate || 'Sep 2026'}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#FAFAF7', borderRadius: '8px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Confidence Score:</span>
                <strong style={{ color: 'var(--primary)' }}>{selectedSub.confidence || 95}% Verified</strong>
              </div>
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button onClick={() => setSelectedSub(null)} className="btn btn-secondary btn-sm">
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
