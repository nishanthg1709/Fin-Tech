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
  currentBalance = 0,
  transactions = [],
  anomalies = [],
  priceChanges = [],
  onNavigate 
}) {
  const [markedForCancel, setMarkedForCancel] = useState(new Set());
  const [selectedSubForEmail, setSelectedSubForEmail] = useState(subscriptions[0] || null);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [filterPriority, setFilterPriority] = useState('ALL'); // ALL, POSITIVE, WARNING, OPPORTUNITY, IMPORTANT

  // Dynamically derive data-backed insights from actual transactions and subscriptions
  const insightsList = useMemo(() => {
    const list = [];
    if (!transactions || transactions.length === 0) return list;

    const debits = transactions.filter(t => t.type === 'DEBIT' || t.type === 'expense' || t.canonical_type === 'expense');
    const credits = transactions.filter(t => t.type === 'CREDIT' || t.type === 'income' || t.canonical_type === 'income');

    const totalSpending = debits.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
    const totalIncome = credits.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
    const netCashFlow = totalIncome - totalSpending;

    // 1. Top Spending Category insight
    const catMap = {};
    debits.forEach(t => {
      const cat = t.category || 'Other';
      if (!catMap[cat]) catMap[cat] = { name: cat, total: 0, count: 0 };
      catMap[cat].total += (Number(t.amount) || 0);
      catMap[cat].count += 1;
    });
    const categories = Object.values(catMap).sort((a, b) => b.total - a.total);
    const topCat = categories[0];

    if (topCat && topCat.total > 0 && totalSpending > 0) {
      const pct = (topCat.total / totalSpending) * 100;
      list.push({
        id: 'ins-top-cat',
        priority: pct > 35 ? 'warning' : 'important',
        category: topCat.name,
        timestamp: 'Category Concentration',
        whatHappened: `Your largest spending category is ${topCat.name} totaling ${formatINR(topCat.total)} (${pct.toFixed(1)}% of spending).`,
        whyItMatters: `${topCat.name} accounts for ${topCat.count} recorded debit transactions in your statement history.`,
        recommendedAction: `Inspect your ${topCat.name} transactions to identify discretionary spending optimization opportunities.`,
        actionText: `Explore ${topCat.name}`
      });
    }

    // 2. Recurring Commitment Pressure insight
    const totalMonthlyRecurring = subscriptions.reduce((sum, s) => sum + (s.normalizedMonthly || s.currentPrice || 0), 0);
    if (subscriptions.length > 0 && totalSpending > 0) {
      const recurringPct = Math.min(100, (totalMonthlyRecurring / Math.max(1, totalSpending)) * 100);
      list.push({
        id: 'ins-recurring',
        priority: recurringPct > 30 ? 'warning' : 'opportunity',
        category: 'Subscriptions',
        timestamp: 'Recurring Commitments',
        whatHappened: `Recurring commitments account for ${recurringPct.toFixed(0)}% of your monthly spending.`,
        whyItMatters: `${subscriptions.length} active recurring mandates deduct an estimated ${formatINR(totalMonthlyRecurring)} every month.`,
        recommendedAction: 'Audit your recurring payment list to cancel unused services or rotate subscriptions.',
        actionText: 'Review Recurring Payments'
      });
    }

    // 3. Net Savings & Cash Flow Margin
    if (totalIncome > 0) {
      const savingsRate = Math.round(((totalIncome - totalSpending) / totalIncome) * 100);
      if (netCashFlow >= 0) {
        list.push({
          id: 'ins-savings',
          priority: 'positive',
          category: 'Savings Margin',
          timestamp: 'Cash Flow Surplus',
          whatHappened: `You generated a positive net savings of ${formatINR(netCashFlow)} (${savingsRate}% savings rate).`,
          whyItMatters: `Total inflow of ${formatINR(totalIncome)} safely exceeded total outflows of ${formatINR(totalSpending)}.`,
          recommendedAction: 'Maintain current spending habits and transfer surplus to liquid high-yield emergency reserves.',
          actionText: 'Inspect Cash Flow'
        });
      } else {
        list.push({
          id: 'ins-deficit',
          priority: 'warning',
          category: 'Cash Flow',
          timestamp: 'Cash Flow Deficit',
          whatHappened: `Outflows exceeded income by ${formatINR(Math.abs(netCashFlow))} across the recorded period.`,
          whyItMatters: `Total debit spending reached ${formatINR(totalSpending)} against ${formatINR(totalIncome)} in total deposits.`,
          recommendedAction: 'Trim discretionary purchases or non-essential shopping to restore positive cash flow.',
          actionText: 'Inspect Outflows'
        });
      }
    }

    // 4. Detected Price Increase
    if (priceChanges && priceChanges.length > 0) {
      const pc = priceChanges[0];
      const diff = pc.newPrice - pc.oldPrice;
      const annualImpact = pc.annualImpact || (diff * 12);
      list.push({
        id: 'ins-price-hike',
        priority: 'important',
        category: 'Price Hikes',
        timestamp: 'Subscription Rate Increase',
        whatHappened: `${pc.merchantName} increased from ${formatINR(pc.oldPrice)} to ${formatINR(pc.newPrice)} (+${pc.percentIncrease || pc.percentageChange || 0}%).`,
        whyItMatters: `This silent recurring hike adds approximately ${formatINR(annualImpact)}/yr to your recurring commitment burn.`,
        recommendedAction: 'Review plan tiers or assess whether alternative plans offer better pricing.',
        actionText: 'Review Price Changes'
      });
    }

    // 5. Active Unusual Transactions Alert
    if (anomalies && anomalies.length > 0) {
      list.push({
        id: 'ins-anomalies',
        priority: 'warning',
        category: 'Outlier Detection',
        timestamp: 'Audit Required',
        whatHappened: `${anomalies.length} unusual transaction alert${anomalies.length > 1 ? 's' : ''} require review.`,
        whyItMatters: 'Outlier transaction amounts or potential duplicate charges were detected in your statement.',
        recommendedAction: 'Examine flagged records in the Unusual Transactions investigator to confirm or dismiss them.',
        actionText: 'Review Flagged Outliers'
      });
    }

    // 6. Liquidity & Runway buffer
    const dailyAvg = totalSpending / Math.max(1, 30);
    const runwayDays = Math.min(365, Math.max(1, Math.round(currentBalance / Math.max(1, dailyAvg))));
    list.push({
      id: 'ins-runway',
      priority: runwayDays >= 60 ? 'positive' : 'opportunity',
      category: 'Liquidity',
      timestamp: 'Financial Cushion',
      whatHappened: `Your current spending pattern provides an estimated ${runwayDays}-day cash runway.`,
      whyItMatters: `Available balance of ${formatINR(currentBalance)} cushions upcoming commitments with a liquid spending buffer.`,
      recommendedAction: 'Maintain an emergency reserve covering at least 60 days of essential household expenses.',
      actionText: 'Inspect Runway Curve'
    });

    return list;
  }, [transactions, subscriptions, priceChanges, anomalies, currentBalance]);

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
    if (insight.category === 'Subscriptions') onNavigate('/subscriptions');
    else if (insight.category === 'Liquidity' || insight.category === 'Savings Margin' || insight.category === 'Cash Flow') onNavigate('/cash-flow');
    else if (insight.category === 'Price Hikes') onNavigate('/price-changes');
    else if (insight.category === 'Outlier Detection') onNavigate('/unusual-transactions');
    else onNavigate('/spending');
  };

  if (!transactions || transactions.length === 0) {
    return (
      <EmptyState
        icon={Sparkles}
        title="No transaction insights available"
        description="Upload a bank statement CSV to generate data-backed insights on spending concentration, savings margins, and recurring commitments."
        actionText="Upload Statement CSV"
        onAction={() => onNavigate ? onNavigate('/upload-transactions') : (window.location.pathname = '/upload-transactions')}
      />
    );
  }

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
        {filteredInsights.length > 0 ? (
          filteredInsights.map(insight => (
            <InsightCard
              key={insight.id}
              insight={insight}
              onAction={handleInsightAction}
            />
          ))
        ) : (
          <div style={{ padding: '36px', background: '#FAFAF7', border: '1px solid var(--border-color)', borderRadius: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            No financial observations found for the selected filter.
          </div>
        )}
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
