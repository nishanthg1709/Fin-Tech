import React, { useState, useMemo } from 'react';
import { 
  Search, 
  HelpCircle, 
  FileText, 
  X, 
  Repeat, 
  LayoutGrid, 
  List, 
  Calendar, 
  TrendingUp, 
  Clock,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { formatINR } from '../utils/formatters.js';
import { SubscriptionTimeline, EmptyState } from './common/index.js';

export function SubscriptionsView({ 
  subscriptions = [], 
  priceChanges = [],
  upcomingBills = null,
  onNavigate
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInterval, setSelectedInterval] = useState('ALL');
  const [viewMode, setViewMode] = useState('timeline'); // 'timeline' | 'cards' | 'table'
  const [selectedSubPanel, setSelectedSubPanel] = useState(null);

  // Available cadence filter tabs
  const availableIntervals = useMemo(() => {
    const defaultTabs = ['ALL', '1 Month', '3 Months', '6 Months', '1 Year'];
    const hasWeekly = subscriptions.some(s => s.interval === 'Weekly' || s.interval === '1 Week');
    if (hasWeekly && !defaultTabs.includes('Weekly')) {
      defaultTabs.push('Weekly');
    }
    return defaultTabs;
  }, [subscriptions]);

  // Subscriptions filtered by cadence interval
  const intervalSubs = useMemo(() => {
    if (selectedInterval === 'ALL') return subscriptions;
    return subscriptions.filter(s => s.interval === selectedInterval);
  }, [subscriptions, selectedInterval]);

  // Further filtered by search query
  const filtered = useMemo(() => {
    return intervalSubs.filter(sub => {
      const matchesSearch = sub.merchantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            sub.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [intervalSubs, searchQuery]);

  // Compute key metrics dynamically for the selected interval view
  const metrics = useMemo(() => {
    const activeSubs = intervalSubs;
    const activeCount = activeSubs.length;

    // Monthly recurring total for selected cadence
    const monthlyTotal = activeSubs.reduce((sum, s) => {
      if (s.normalizedMonthly) return sum + s.normalizedMonthly;
      if (s.interval === '1 Month') return sum + s.currentPrice;
      if (s.interval === '3 Months') return sum + Math.round(s.currentPrice / 3);
      if (s.interval === '6 Months') return sum + Math.round(s.currentPrice / 6);
      if (s.interval === '1 Year') return sum + Math.round(s.currentPrice / 12);
      if (s.interval === 'Weekly' || s.interval === '1 Week') return sum + Math.round(s.currentPrice * 4.33);
      return sum + s.currentPrice;
    }, 0);

    // Annual recurring commitment for selected cadence
    const annualTotal = activeSubs.reduce((sum, s) => {
      if (s.annualCost) return sum + s.annualCost;
      if (s.interval === '1 Month') return sum + s.currentPrice * 12;
      if (s.interval === '3 Months') return sum + s.currentPrice * 4;
      if (s.interval === '6 Months') return sum + s.currentPrice * 2;
      if (s.interval === '1 Year') return sum + s.currentPrice;
      if (s.interval === 'Weekly' || s.interval === '1 Week') return sum + s.currentPrice * 52;
      return sum + (s.currentPrice * 12);
    }, 0);

    const activeSubIds = new Set(activeSubs.map(s => s.id));
    const matchingPriceChanges = priceChanges.filter(pc => activeSubIds.has(pc.subscriptionId));

    // Dynamic upcoming renewal derived from predictions or active subscriptions
    let nextUpcoming = null;
    if (upcomingBills?.predictions && upcomingBills.predictions.length > 0) {
      nextUpcoming = upcomingBills.predictions.find(p => activeSubIds.has(p.subscriptionId));
    }

    if (!nextUpcoming && activeSubs.length > 0) {
      const sortedByDate = [...activeSubs].sort((a, b) => new Date(b.lastBillingDate) - new Date(a.lastBillingDate));
      const first = sortedByDate[0];
      nextUpcoming = {
        merchantName: first.merchantName,
        amount: first.currentPrice,
        daysRemaining: 14,
        predictedDate: first.lastBillingDate
      };
    }

    return {
      activeCount,
      monthlyTotal,
      annualTotal,
      priceChangesCount: matchingPriceChanges.length,
      nextUpcoming
    };
  }, [intervalSubs, priceChanges, upcomingBills]);

  // Clear Empty State when no recurring transactions detected
  if (!subscriptions || subscriptions.length === 0) {
    return (
      <EmptyState
        title="No recurring transactions detected yet."
        description="Upload a CSV statement or connect your bank account to automatically analyze and detect recurring payments."
        actionText="Upload Statement CSV"
        onAction={() => onNavigate ? onNavigate('/upload-transactions') : (window.location.pathname = '/upload-transactions')}
      />
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px', marginBottom: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <div className="icon-box-mint">
                <Repeat size={18} color="var(--primary)" />
              </div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, letterSpacing: '-0.02em' }}>
                Active <span style={{ color: 'var(--primary)' }}>Subscriptions</span>
              </h2>
            </div>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', margin: 0 }}>
              Automated cadence tracking with interactive payment timelines, renewal dates, and price hike monitoring.
            </p>
          </div>

          {/* View Mode Toggle: Timeline, Cards, Table */}
          <div style={{ display: 'flex', background: '#FAFAF7', padding: '3px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            {[
              { id: 'timeline', label: 'Payment Timeline' },
              { id: 'cards', label: 'Cards' },
              { id: 'table', label: 'Table' }
            ].map(m => (
              <button
                key={m.id}
                onClick={() => setViewMode(m.id)}
                style={{
                  background: viewMode === m.id ? 'var(--badge-bg)' : 'transparent',
                  color: viewMode === m.id ? 'var(--primary)' : 'var(--text-muted)',
                  border: viewMode === m.id ? '1px solid #D6E7DC' : '1px solid transparent',
                  padding: '5px 12px',
                  borderRadius: '7px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Cadence Tabs: 1 Month, 3 Months, 6 Months, 1 Year */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px', 
          overflowX: 'auto', 
          paddingBottom: '4px',
          marginBottom: '20px'
        }}>
          {availableIntervals.map(tab => {
            const count = tab === 'ALL' 
              ? subscriptions.length 
              : subscriptions.filter(s => s.interval === tab).length;
            const isSelected = selectedInterval === tab;
            const label = tab === 'ALL' ? 'All Cadences' : tab;

            return (
              <button
                key={tab}
                onClick={() => setSelectedInterval(tab)}
                style={{
                  background: isSelected ? 'var(--primary)' : '#FAFAF7',
                  color: isSelected ? '#FFFFFF' : 'var(--text-main)',
                  border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                  padding: '7px 16px',
                  borderRadius: '9999px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease'
                }}
              >
                <span>{label}</span>
                <span style={{
                  background: isSelected ? 'rgba(255,255,255,0.25)' : 'var(--border-color)',
                  color: isSelected ? '#FFFFFF' : 'var(--text-muted)',
                  fontSize: '0.7rem',
                  padding: '1px 6px',
                  borderRadius: '10px',
                  fontWeight: 700
                }}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* 5 SUMMARY METRICS TILES */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
          
          <div style={{ background: '#FAFAF7', padding: '16px', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '4px' }}>
              Active Subscriptions
            </div>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-main)' }}>
              {metrics.activeCount} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>services</span>
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--primary)', marginTop: '2px', fontWeight: 600 }}>
              {selectedInterval === 'ALL' ? 'All recurring cadences' : `${selectedInterval} cadence`}
            </div>
          </div>

          <div style={{ background: '#FAFAF7', padding: '16px', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '4px' }}>
              Monthly Subscription Cost
            </div>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-main)' }}>
              {formatINR(metrics.monthlyTotal)}<span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>/mo</span>
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Normalized monthly commitment
            </div>
          </div>

          <div style={{ background: '#FAFAF7', padding: '16px', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '4px' }}>
              Annual Subscription Cost
            </div>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--primary)' }}>
              {formatINR(metrics.annualTotal)}<span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>/yr</span>
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Total annual commitment
            </div>
          </div>

          <div style={{ background: '#FAFAF7', padding: '16px', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '4px' }}>
              Upcoming Renewals
            </div>
            {metrics.nextUpcoming ? (
              <>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {metrics.nextUpcoming.merchantName} · {formatINR(metrics.nextUpcoming.amount)}
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--primary)', fontWeight: 600, marginTop: '2px' }}>
                  Due in {metrics.nextUpcoming.daysRemaining} {metrics.nextUpcoming.daysRemaining === 1 ? 'day' : 'days'}
                </div>
              </>
            ) : (
              <>
                <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                  None scheduled
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  No upcoming charges in view
                </div>
              </>
            )}
          </div>

          <div style={{ background: '#FAFAF7', padding: '16px', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '4px' }}>
              Price Changes
            </div>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: metrics.priceChangesCount > 0 ? 'var(--accent-rose)' : 'var(--primary)' }}>
              {metrics.priceChangesCount} detected
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              {metrics.priceChangesCount > 0 ? 'Rate hikes in view' : 'All rates stable'}
            </div>
          </div>

        </div>

        {/* Search Bar & Results Counter */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginTop: '18px', paddingTop: '16px', borderTop: '1px solid var(--border-color)', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', maxWidth: '320px', width: '100%' }}>
            <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search recurring merchant or category..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="input-text"
              style={{ paddingLeft: '36px', height: '36px', fontSize: '0.82rem' }}
            />
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Showing <strong>{filtered.length}</strong> of <strong>{subscriptions.length}</strong> recurring commitments
          </div>
        </div>

      </div>

      {/* 1. SIGNATURE SUBSCRIPTION PAYMENT TIMELINE (Section 8) */}
      {viewMode === 'timeline' && (
        <SubscriptionTimeline
          subscriptions={filtered}
          priceChanges={priceChanges}
          onSelectSubscription={(sub) => setSelectedSubPanel(sub)}
        />
      )}

      {/* 2. SUBSCRIPTION CARDS VIEW */}
      {viewMode === 'cards' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
          {filtered.map(sub => {
            const priceChange = priceChanges.find(pc => pc.subscriptionId === sub.id);

            return (
              <div 
                key={sub.id} 
                onClick={() => setSelectedSubPanel(sub)}
                className="glass-card" 
                style={{ 
                  padding: '22px', 
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div className="icon-box-mint" style={{ width: '36px', height: '36px', borderRadius: '8px', fontWeight: 800 }}>
                        {sub.merchantName.charAt(0)}
                      </div>
                      <div>
                        <strong style={{ fontSize: '0.96rem', color: 'var(--text-main)' }}>
                          {sub.merchantName}
                        </strong>
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                          {sub.category}
                        </div>
                      </div>
                    </div>

                    <span className="badge badge-emerald" style={{ fontSize: '0.68rem' }}>
                      {sub.interval}
                    </span>
                  </div>

                  <div style={{ background: '#FAFAF7', padding: '12px 14px', borderRadius: '10px', border: '1px solid var(--border-color)', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                        Charge
                      </div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>
                        {formatINR(sub.currentPrice)}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                        Annual
                      </div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--primary)' }}>
                        {formatINR(sub.annualCost)}/yr
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
                  <span>Last paid: {sub.lastBillingDate}</span>
                  <span style={{ color: 'var(--primary)', fontWeight: 600 }}>Click for details →</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 3. SUBSCRIPTIONS TABLE VIEW */}
      {viewMode === 'table' && (
        <div className="glass-panel" style={{ padding: '0px', background: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: '18px', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
              <thead>
                <tr style={{ background: '#FAFAF7', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '14px 18px', fontWeight: 600 }}>MERCHANT</th>
                  <th style={{ padding: '14px 18px', fontWeight: 600 }}>CATEGORY</th>
                  <th style={{ padding: '14px 18px', fontWeight: 600 }}>INTERVAL</th>
                  <th style={{ padding: '14px 18px', fontWeight: 600 }}>AMOUNT</th>
                  <th style={{ padding: '14px 18px', fontWeight: 600 }}>ANNUAL COST</th>
                  <th style={{ padding: '14px 18px', fontWeight: 600 }}>LAST BILLED</th>
                  <th style={{ padding: '14px 18px', fontWeight: 600 }}>CONFIDENCE</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(sub => (
                  <tr 
                    key={sub.id}
                    onClick={() => setSelectedSubPanel(sub)}
                    style={{ borderBottom: '1px solid var(--border-color)', cursor: 'pointer', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#F5F6F2'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div className="icon-box-mint" style={{ width: '30px', height: '30px', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 700 }}>
                          {sub.merchantName.charAt(0)}
                        </div>
                        <strong style={{ color: 'var(--text-main)' }}>{sub.merchantName}</strong>
                      </div>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <span className="badge badge-muted" style={{ fontSize: '0.7rem' }}>
                        {sub.category}
                      </span>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <span className="badge badge-emerald" style={{ fontSize: '0.7rem' }}>
                        {sub.interval}
                      </span>
                    </td>
                    <td style={{ padding: '14px 18px', fontWeight: 700, color: 'var(--text-main)' }}>
                      {formatINR(sub.currentPrice)}
                    </td>
                    <td style={{ padding: '14px 18px', color: 'var(--text-muted)' }}>
                      {formatINR(sub.annualCost)}/year
                    </td>
                    <td style={{ padding: '14px 18px', color: 'var(--text-muted)' }}>
                      {sub.lastBillingDate}
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <span style={{ color: 'var(--primary)', fontWeight: 600 }}>
                        {sub.confidence}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DETAILED SUBSCRIPTION PANEL MODAL */}
      {selectedSubPanel && (
        <div className="modal-overlay" onClick={() => setSelectedSubPanel(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px', padding: '26px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div className="icon-box-mint" style={{ width: '42px', height: '42px', borderRadius: '10px', fontSize: '1rem', fontWeight: 800 }}>
                  {selectedSubPanel.merchantName.charAt(0)}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.2rem', color: 'var(--text-main)', margin: 0, fontWeight: 800 }}>
                    {selectedSubPanel.merchantName}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px' }}>
                    <span className="badge badge-emerald" style={{ fontSize: '0.68rem' }}>
                      {selectedSubPanel.interval} Cadence
                    </span>
                    <span className="badge badge-muted" style={{ fontSize: '0.68rem' }}>
                      {selectedSubPanel.category}
                    </span>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setSelectedSubPanel(null)} 
                className="btn btn-secondary btn-sm" 
                style={{ borderRadius: '50%', width: '28px', height: '28px', padding: 0 }}
              >
                <X size={14} />
              </button>
            </div>

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
                  {formatINR(selectedSubPanel.currentPrice)}
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                  Annual Cost
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary)' }}>
                  {formatINR(selectedSubPanel.annualCost || selectedSubPanel.currentPrice * 12)}/yr
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.82rem', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#FAFAF7', borderRadius: '8px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Billing Cycle:</span>
                <strong style={{ color: 'var(--text-main)' }}>{selectedSubPanel.interval}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#FAFAF7', borderRadius: '8px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Next Payment Due:</span>
                <strong style={{ color: 'var(--primary)' }}>
                  {(() => {
                    const up = upcomingBills?.predictions?.find(p => p.subscriptionId === selectedSubPanel.id);
                    return up ? `Due in ${up.daysRemaining} days (${up.predictedDate})` : 'Active on schedule';
                  })()}
                </strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#FAFAF7', borderRadius: '8px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Last Billed Date:</span>
                <strong style={{ color: 'var(--text-main)' }}>{selectedSubPanel.lastBillingDate}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#FAFAF7', borderRadius: '8px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Cadence Confidence:</span>
                <strong style={{ color: 'var(--primary)' }}>{selectedSubPanel.confidence || 95}% Verified</strong>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button onClick={() => setSelectedSubPanel(null)} className="btn btn-primary btn-sm">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
