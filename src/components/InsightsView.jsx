import React, { useState, useMemo } from 'react';
import { 
  Sparkles, 
  TrendingDown, 
  TrendingUp, 
  AlertTriangle, 
  Calendar, 
  Repeat, 
  Copy, 
  Check, 
  Lightbulb, 
  ChevronRight,
  ShieldCheck,
  Wallet
} from 'lucide-react';
import { formatINR } from '../utils/formatters.js';
import { InsightCard, EmptyState } from './common/index.js';

export function InsightsView({ 
  subscriptions = [], 
  currentBalance = 78450.0,
  transactions = [],
  anomalies = [],
  priceChanges = [],
  onNavigate 
}) {
  const [markedForCancel, setMarkedForCancel] = useState(new Set());
  const [selectedSubForEmail, setSelectedSubForEmail] = useState(subscriptions[0] || null);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [filterPriority, setFilterPriority] = useState('ALL'); // ALL, POSITIVE, WARNING, OPPORTUNITY, IMPORTANT

  // Structured Insight Feed matching user prompt specification (Section 13)
  const insightsList = useMemo(() => {
    return [
      {
        id: 'ins-1',
        priority: 'warning',
        category: 'Food & Dining',
        timestamp: 'Oct 08 · Monthly Trend',
        whatHappened: 'Food spending increased 18% this month.',
        whyItMatters: 'Discretionary dining and delivery outlays totaled ₹7,200, exceeding your 60-day historical average by ₹1,100.',
        recommendedAction: 'Set a weekly dining cap of ₹1,500 for the next 2 weeks to preserve your liquid savings target.',
        actionText: 'Explore Dining Outflows'
      },
      {
        id: 'ins-2',
        priority: 'important',
        category: 'Subscriptions',
        timestamp: 'Oct 02 · Price Hike Detected',
        whatHappened: 'Netflix increased from ₹499 to ₹649 (+30.1%).',
        whyItMatters: 'Silent recurring rate increase adds approximately ₹1,800 to your annual recurring commitment burn.',
        recommendedAction: 'Review your streaming tier or rotate between active platforms to eliminate subscription overlap.',
        actionText: 'Review Price Changes'
      },
      {
        id: 'ins-3',
        priority: 'warning',
        category: 'Shopping',
        timestamp: 'Oct 07 · Spending Velocity',
        whatHappened: 'You spent ₹3,200 more on shopping this month.',
        whyItMatters: 'Retail e-commerce orders on Amazon and Myntra accounted for 13.8% of all debit outflows.',
        recommendedAction: 'Pause non-essential cart purchases until the next billing statement closes.',
        actionText: 'View Shopping Txns'
      },
      {
        id: 'ins-4',
        priority: 'opportunity',
        category: 'Renewals & Cadence',
        timestamp: 'Oct 08 · Schedule Radar',
        whatHappened: 'You have 3 subscriptions renewing this week.',
        whyItMatters: 'Netflix (₹649), Adobe Creative Cloud (₹1,675), and Canva (₹499) will deduct ₹2,823 within the next 8 days.',
        recommendedAction: 'Verify active mandate authorizations and ensure sufficient balance in your primary HDFC account.',
        actionText: 'Check Payment Timeline'
      },
      {
        id: 'ins-5',
        priority: 'positive',
        category: 'Cash Runway',
        timestamp: 'Oct 08 · Liquidity Health',
        whatHappened: 'Your current spending pattern gives you a 47-day cash runway.',
        whyItMatters: 'Opening balance of ₹78,450 comfortably cushions expected recurring deductions of ₹22,561 with ₹55,889 safe-to-spend buffer.',
        recommendedAction: 'Maintain current liquidity cushion of at least ₹25,000 to prevent overdraft charges.',
        actionText: 'Inspect Runway Curve'
      }
    ];
  }, []);

  const filteredInsights = useMemo(() => {
    if (filterPriority === 'ALL') return insightsList;
    return insightsList.filter(i => i.priority.toUpperCase() === filterPriority);
  }, [insightsList, filterPriority]);

  // Savings simulator math
  const cancelledSubs = subscriptions.filter(s => markedForCancel.has(s.id));
  const simulatedMonthlySavings = cancelledSubs.reduce((sum, s) => {
    if (s.interval === '1 Month') return sum + s.currentPrice;
    if (s.interval === '3 Months') return sum + Math.round(s.currentPrice / 3);
    if (s.interval === '6 Months') return sum + Math.round(s.currentPrice / 6);
    if (s.interval === '1 Year') return sum + Math.round(s.currentPrice / 12);
    return sum + s.currentPrice;
  }, 0);

  const simulatedAnnualSavings = cancelledSubs.reduce((sum, s) => sum + (s.annualCost || (s.currentPrice * 12)), 0);

  const toggleCancel = (id) => {
    const next = new Set(markedForCancel);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setMarkedForCancel(next);
  };

  const getEmailContent = () => {
    if (!selectedSubForEmail) return '';
    return `Subject: Cancellation Request - ${selectedSubForEmail.merchantName} Account

Dear Support Team,

I am writing to formally request the cancellation of my recurring subscription for ${selectedSubForEmail.merchantName}.

Subscription Details:
- Service: ${selectedSubForEmail.merchantName}
- Cadence: ${selectedSubForEmail.interval}
- Current Recurring Charge: ${formatINR(selectedSubForEmail.currentPrice)}

Please ensure that:
1. All recurring auto-debit authorizations linked to my payment method are revoked immediately.
2. No further recurring charges occur after the current paid period.
3. Confirmation of this cancellation is sent to this email address.

Thank you,
Primary Account Holder`;
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(getEmailContent());
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2500);
  };

  const handleInsightAction = (insight) => {
    if (!onNavigate) return;
    if (insight.category === 'Subscriptions' || insight.category === 'Renewals & Cadence') onNavigate('/subscriptions');
    else if (insight.category === 'Cash Runway') onNavigate('/cash-flow');
    else if (insight.category === 'Food & Dining' || insight.category === 'Shopping') onNavigate('/spending');
    else onNavigate('/transactions');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '26px' }}>
      
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
              <div className="icon-box-mint">
                <Sparkles size={18} color="var(--primary)" />
              </div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, letterSpacing: '-0.02em' }}>
                Personalized <span style={{ color: 'var(--primary)' }}>Insight Feed</span>
              </h2>
            </div>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', margin: 0 }}>
              Meaningful financial observations with clear context on what happened, why it matters, and recommended actions.
            </p>
          </div>

          {/* Priority Filter Tabs */}
          <div style={{ display: 'flex', background: '#FAFAF7', padding: '3px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', overflowX: 'auto' }}>
            {[
              { id: 'ALL', label: 'All Observations' },
              { id: 'IMPORTANT', label: 'Important' },
              { id: 'WARNING', label: 'Warnings' },
              { id: 'OPPORTUNITY', label: 'Opportunities' },
              { id: 'POSITIVE', label: 'Positive' }
            ].map(p => (
              <button
                key={p.id}
                type="button"
                onClick={() => setFilterPriority(p.id)}
                style={{
                  background: filterPriority === p.id ? 'var(--badge-bg)' : 'transparent',
                  color: filterPriority === p.id ? 'var(--primary)' : 'var(--text-muted)',
                  border: filterPriority === p.id ? '1px solid #D6E7DC' : '1px solid transparent',
                  padding: '5px 12px',
                  borderRadius: '7px',
                  fontSize: '0.76rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  whiteSpace: 'nowrap'
                }}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Intelligence Domain Pillars */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', paddingTop: '12px', borderTop: '1px solid var(--border-color)' }}>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, alignSelf: 'center', marginRight: '4px' }}>
            Core Domains:
          </span>
          <span className="badge badge-emerald" style={{ fontSize: '0.75rem' }}>
            Spending Patterns
          </span>
          <span className="badge badge-emerald" style={{ fontSize: '0.75rem' }}>
            Subscription Intelligence
          </span>
          <span className="badge badge-amber" style={{ fontSize: '0.75rem' }}>
            Cash-Flow Warnings
          </span>
          <span className="badge badge-emerald" style={{ fontSize: '0.75rem' }}>
            Savings Opportunities
          </span>
        </div>
      </div>

      {/* 1. STRUCTURED INSIGHT FEED (Section 13) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {filteredInsights.map(insight => (
          <InsightCard
            key={insight.id}
            insight={insight}
            onAction={handleInsightAction}
          />
        ))}
      </div>

      {/* 2. SAVINGS OPPORTUNITIES & INTERACTIVE CANCELLATION SIMULATOR */}
      <div 
        className="glass-panel" 
        style={{ 
          padding: '26px 28px', 
          background: '#FFFFFF', 
          border: '1px solid var(--border-color)', 
          borderRadius: '20px' 
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 4px 0', letterSpacing: '-0.02em' }}>
              Interactive Savings Simulator
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>
              Test removing underutilized subscriptions to calculate immediate monthly cash-flow recovery.
            </p>
          </div>

          <span className="badge badge-emerald">
            {markedForCancel.size} Subscriptions Selected
          </span>
        </div>

        {/* Savings Tiles */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', marginBottom: '20px' }}>
          <div style={{ background: '#FAFAF7', padding: '18px', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '4px' }}>
              Simulated Monthly Savings
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary)' }}>
              +{formatINR(simulatedMonthlySavings)}<span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>/mo</span>
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Immediate monthly cash flow increase
            </div>
          </div>

          <div style={{ background: '#FAFAF7', padding: '18px', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '4px' }}>
              Simulated Annual Savings
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary)' }}>
              +{formatINR(simulatedAnnualSavings)}<span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>/yr</span>
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Cumulative yearly cost reduction
            </div>
          </div>
        </div>

        {/* Workbench: Selection & 1-Click Notice */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
          
          {/* Subscriptions Checklist */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '340px', overflowY: 'auto' }}>
            {subscriptions.map(sub => {
              const isSelected = markedForCancel.has(sub.id);

              return (
                <div
                  key={sub.id}
                  onClick={() => {
                    toggleCancel(sub.id);
                    setSelectedSubForEmail(sub);
                  }}
                  style={{
                    background: isSelected ? '#FFF5F5' : '#FAFAF7',
                    border: `1px solid ${isSelected ? '#FECDD3' : 'var(--border-color)'}`,
                    borderRadius: '12px',
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <input 
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      style={{ accentColor: 'var(--accent-rose)', width: '16px', height: '16px', cursor: 'pointer' }}
                    />
                    <div>
                      <strong style={{ fontSize: '0.88rem', color: isSelected ? '#BE123C' : 'var(--text-main)', textDecoration: isSelected ? 'line-through' : 'none' }}>
                        {sub.merchantName}
                      </strong>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {sub.interval} cadence
                      </div>
                    </div>
                  </div>

                  <strong style={{ fontSize: '0.92rem', color: isSelected ? '#BE123C' : 'var(--text-main)' }}>
                    {formatINR(sub.currentPrice)}
                  </strong>
                </div>
              );
            })}
          </div>

          {/* Cancellation Notice Generator */}
          <div style={{ background: '#FAFAF7', border: '1px solid var(--border-color)', borderRadius: '14px', padding: '18px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <div>
                <strong style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>
                  1-Click Formal Cancellation Notice
                </strong>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Auto-populated mandate revocation draft
                </div>
              </div>

              <button
                type="button"
                onClick={handleCopyEmail}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.76rem', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                {copiedEmail ? <Check size={13} color="var(--primary)" /> : <Copy size={13} />}
                <span>{copiedEmail ? 'Copied' : 'Copy Notice'}</span>
              </button>
            </div>

            <textarea
              readOnly
              value={getEmailContent()}
              style={{
                flex: 1,
                minHeight: '200px',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.76rem',
                lineHeight: 1.5,
                padding: '12px',
                borderRadius: '10px',
                background: '#FFFFFF',
                border: '1px solid var(--border-color)',
                color: 'var(--text-main)',
                resize: 'none',
                outline: 'none'
              }}
            />
          </div>

        </div>

      </div>

    </div>
  );
}
