import React, { useState, useMemo, useCallback } from 'react';
import { 
  Repeat, 
  HelpCircle, 
  X, 
  ChevronDown, 
  ChevronUp, 
  Search, 
  Calendar, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  Home, 
  Smartphone, 
  Zap, 
  Shield, 
  Tv, 
  CreditCard, 
  ArrowRight, 
  Clock, 
  Sparkles, 
  Filter, 
  Check, 
  Eye, 
  RefreshCw,
  LayoutGrid,
  List,
  AlertCircle
} from 'lucide-react';
import { formatINR } from '../utils/formatters.js';
import { EmptyState } from './common/index.js';

// Format short date helper (e.g. "Oct 15" or "Sep 15")
function formatShortDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return String(dateStr);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[d.getMonth()]} ${d.getDate()}`;
}

// Format full date helper (e.g. "Sep 15, 2026")
function formatFullDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return String(dateStr);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

// Category icon helper
function getCategoryIcon(classification, category = '', merchantName = '') {
  const text = `${merchantName} ${category}`.toUpperCase();
  if (text.includes('RENT') || text.includes('HOUSE') || text.includes('LANDLORD')) return <Home size={17} color="#2D5A43" />;
  if (text.includes('JIO') || text.includes('AIRTEL') || text.includes('VI ') || text.includes('VODAFONE') || text.includes('BROADBAND') || text.includes('PHONE')) return <Smartphone size={17} color="#2563EB" />;
  if (text.includes('POWER') || text.includes('ELECTRICITY') || text.includes('BESCOM') || text.includes('GAS') || text.includes('WATER') || text.includes('UTILITIES')) return <Zap size={17} color="#D97706" />;
  if (text.includes('INSURANCE') || text.includes('ERGO') || text.includes('POLICY') || text.includes('LOAN') || text.includes('EMI')) return <Shield size={17} color="#059669" />;
  if (classification === 'SUBSCRIPTION') return <Tv size={17} color="var(--primary)" />;
  return <CreditCard size={17} color="var(--text-muted)" />;
}

export function SubscriptionsView({ 
  subscriptions = [], 
  recurringPayments = [],
  unconfirmedRepeated = [],
  singlePaymentMerchants = [],
  priceChanges = [],
  upcomingBills = null,
  summary = null,
  rawTransactions = [],
  onNavigate,
  onRecurrenceOverrideChange
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('ALL'); // 'ALL' | 'SUBSCRIPTIONS' | 'BILLS' | 'COMMITMENTS' | 'OTHER'
  const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'table' | 'timeline'
  const [expandedReasonId, setExpandedReasonId] = useState(null);
  const [selectedDetailItem, setSelectedDetailItem] = useState(null);
  const [showSinglePayments, setShowSinglePayments] = useState(false);

  // Local overrides tracking for immediate responsive UI feedback
  const [localOverrides, setLocalOverrides] = useState(() => {
    try {
      const stored = localStorage.getItem('smart_expense_recurrence_overrides');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  // Master recurring items list derived directly from uploaded data
  const masterRecurring = useMemo(() => {
    const source = (recurringPayments && recurringPayments.length > 0) ? recurringPayments : subscriptions;
    // Filter out any merchants explicitly marked as NOT_RECURRING by user
    return source.filter(item => localOverrides[item.merchantName] !== 'NOT_RECURRING');
  }, [recurringPayments, subscriptions, localOverrides]);

  // Classification segments
  const actualSubscriptions = useMemo(() => {
    return masterRecurring.filter(item => item.classification === 'SUBSCRIPTION');
  }, [masterRecurring]);

  const recurringBills = useMemo(() => {
    return masterRecurring.filter(item => item.classification === 'BILL');
  }, [masterRecurring]);

  const recurringCommitments = useMemo(() => {
    return masterRecurring.filter(item => item.classification === 'COMMITMENT');
  }, [masterRecurring]);

  const otherRecurring = useMemo(() => {
    return masterRecurring.filter(item => item.classification === 'OTHER');
  }, [masterRecurring]);

  // Unconfirmed repeated list (false positives / needs review)
  const activeUnconfirmed = useMemo(() => {
    const list = (unconfirmedRepeated && unconfirmedRepeated.length > 0) 
      ? unconfirmedRepeated 
      : (masterRecurring.unconfirmedRepeated || []);
    return list.filter(item => !localOverrides[item.merchantName]);
  }, [unconfirmedRepeated, masterRecurring.unconfirmedRepeated, localOverrides]);

  // Single payment merchants (insufficient data state)
  const activeSinglePayments = useMemo(() => {
    const list = (singlePaymentMerchants && singlePaymentMerchants.length > 0)
      ? singlePaymentMerchants
      : (masterRecurring.singlePaymentMerchants || []);
    return list.filter(item => !localOverrides[item.merchantName]);
  }, [singlePaymentMerchants, masterRecurring.singlePaymentMerchants, localOverrides]);

  // TOP 4 SUMMARY CARD CALCULATIONS (Section 5 & 14)
  // Card 1: Active Subscriptions (Category A only)
  const activeSubscriptionsCount = actualSubscriptions.length;

  // Card 2: Monthly Subscription Cost (Category A only)
  const monthlySubscriptionCost = useMemo(() => {
    return actualSubscriptions.reduce((sum, s) => {
      if (s.normalizedMonthly !== undefined) return sum + s.normalizedMonthly;
      if (s.interval === 'Weekly') return sum + Math.round((s.currentPrice * 52) / 12);
      if (s.interval === '3 Months') return sum + Math.round(s.currentPrice / 3);
      if (s.interval === '6 Months') return sum + Math.round(s.currentPrice / 6);
      if (s.interval === '1 Year') return sum + Math.round(s.currentPrice / 12);
      return sum + s.currentPrice;
    }, 0);
  }, [actualSubscriptions]);

  const annualSubscriptionCost = monthlySubscriptionCost * 12;

  // Card 3: Total Monthly Recurring Commitments (Categories A + B + C + D)
  const totalMonthlyRecurring = useMemo(() => {
    return masterRecurring.reduce((sum, s) => {
      if (s.normalizedMonthly !== undefined) return sum + s.normalizedMonthly;
      if (s.interval === 'Weekly') return sum + Math.round((s.currentPrice * 52) / 12);
      if (s.interval === '3 Months') return sum + Math.round(s.currentPrice / 3);
      if (s.interval === '6 Months') return sum + Math.round(s.currentPrice / 6);
      if (s.interval === '1 Year') return sum + Math.round(s.currentPrice / 12);
      return sum + s.currentPrice;
    }, 0);
  }, [masterRecurring]);

  // Card 4: Next Payment (Nearest confidently predicted recurring payment)
  const nextPaymentPrediction = useMemo(() => {
    if (upcomingBills?.predictions && upcomingBills.predictions.length > 0) {
      // Find nearest predicted payment
      const sorted = [...upcomingBills.predictions].sort((a, b) => a.daysRemaining - b.daysRemaining);
      const first = sorted[0];
      if (first) {
        return {
          merchantName: first.merchantName,
          amount: first.amount,
          dateLabel: formatShortDate(first.predictedDate),
          fullDate: formatFullDate(first.predictedDate),
          daysRemaining: first.daysRemaining,
          isConfident: first.isNextDateConfident !== false
        };
      }
    }

    // Fallback: check master recurring items
    if (masterRecurring.length > 0) {
      const confidentItems = masterRecurring.filter(m => m.isNextDateConfident);
      const pool = confidentItems.length > 0 ? confidentItems : masterRecurring;
      const sorted = [...pool].sort((a, b) => {
        const dA = new Date(a.nextEstimatedDate || a.lastBillingDate);
        const dB = new Date(b.nextEstimatedDate || b.lastBillingDate);
        return dA - dB;
      });
      const first = sorted[0];
      if (first) {
        return {
          merchantName: first.merchantName,
          amount: first.currentPrice,
          dateLabel: formatShortDate(first.nextEstimatedDate || first.lastBillingDate),
          fullDate: formatFullDate(first.nextEstimatedDate || first.lastBillingDate),
          daysRemaining: 14,
          isConfident: first.isNextDateConfident === true
        };
      }
    }

    return null;
  }, [upcomingBills, masterRecurring]);

  // Filtered dataset according to active filter and search query
  const displayedItems = useMemo(() => {
    let base = masterRecurring;
    if (selectedFilter === 'SUBSCRIPTIONS') base = actualSubscriptions;
    else if (selectedFilter === 'BILLS') base = recurringBills;
    else if (selectedFilter === 'COMMITMENTS') base = recurringCommitments;
    else if (selectedFilter === 'OTHER') base = otherRecurring;

    if (!searchQuery.trim()) return base;
    const q = searchQuery.toLowerCase().trim();
    return base.filter(item => 
      item.merchantName.toLowerCase().includes(q) ||
      (item.category && item.category.toLowerCase().includes(q)) ||
      (item.classificationLabel && item.classificationLabel.toLowerCase().includes(q))
    );
  }, [masterRecurring, actualSubscriptions, recurringBills, recurringCommitments, otherRecurring, selectedFilter, searchQuery]);

  // Upcoming Timeline entries sorted chronologically (Section 9)
  const upcomingTimeline = useMemo(() => {
    const list = [];
    for (const item of masterRecurring) {
      const targetDate = item.nextEstimatedDate || item.lastBillingDate;
      if (!targetDate) continue;
      const d = new Date(targetDate);
      if (isNaN(d.getTime())) continue;

      const monthNames = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
      const monthLabel = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
      const dayLabel = formatShortDate(targetDate);

      list.push({
        id: item.id,
        merchantName: item.merchantName,
        classification: item.classification,
        classificationLabel: item.classificationLabel,
        amount: item.currentPrice,
        frequencyLabel: item.frequencyLabel || item.interval,
        targetDate,
        dateEpoch: d.getTime(),
        monthLabel,
        dayLabel,
        isConfident: item.isNextDateConfident === true
      });
    }

    return list.sort((a, b) => a.dateEpoch - b.dateEpoch);
  }, [masterRecurring]);

  // Timeline grouped by Month (e.g. "OCTOBER 2026")
  const groupedTimeline = useMemo(() => {
    const groups = {};
    for (const entry of upcomingTimeline) {
      if (!groups[entry.monthLabel]) {
        groups[entry.monthLabel] = [];
      }
      groups[entry.monthLabel].push(entry);
    }
    return groups;
  }, [upcomingTimeline]);

  // Actions for False Positive Handling (Section 11)
  const handleMarkNotRecurring = useCallback((merchantName) => {
    const updated = { ...localOverrides, [merchantName]: 'NOT_RECURRING' };
    setLocalOverrides(updated);
    try {
      localStorage.setItem('smart_expense_recurrence_overrides', JSON.stringify(updated));
    } catch {}
    if (onRecurrenceOverrideChange) {
      onRecurrenceOverrideChange(merchantName, 'NOT_RECURRING');
    }
  }, [localOverrides, onRecurrenceOverrideChange]);

  const handleMarkAsRecurring = useCallback((merchantName) => {
    const updated = { ...localOverrides, [merchantName]: 'RECURRING' };
    setLocalOverrides(updated);
    try {
      localStorage.setItem('smart_expense_recurrence_overrides', JSON.stringify(updated));
    } catch {}
    if (onRecurrenceOverrideChange) {
      onRecurrenceOverrideChange(merchantName, 'RECURRING');
    }
  }, [localOverrides, onRecurrenceOverrideChange]);

  // Section 12: Empty State when no transactions uploaded or 0 recurring detected
  if (!masterRecurring || masterRecurring.length === 0) {
    return (
      <EmptyState
        title="No recurring payments detected yet"
        description="No recurring transactions detected yet. Upload your transaction history to identify subscriptions, bills and recurring commitments."
        actionText="Upload Transactions"
        onAction={() => onNavigate ? onNavigate('/upload-transactions') : (window.location.pathname = '/upload-transactions')}
      />
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* 1. HEADER PANEL: Page Purpose & Subtitle (Section 1) */}
      <div 
        className="glass-panel" 
        style={{ 
          padding: '24px 28px', 
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
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, letterSpacing: '-0.02em' }}>
                Recurring Payments
              </h2>
            </div>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', margin: 0 }}>
              Recurring payments detected from your transaction history
            </p>
          </div>

          {/* View Mode Switcher: Cards, Table, Timeline */}
          <div style={{ display: 'flex', background: '#FAFAF7', padding: '3px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            {[
              { id: 'cards', label: 'Cards', icon: LayoutGrid },
              { id: 'table', label: 'Table', icon: List },
              { id: 'timeline', label: 'Upcoming Schedule', icon: Calendar }
            ].map(m => {
              const Icon = m.icon;
              return (
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
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    transition: 'all 0.15s'
                  }}
                >
                  <Icon size={13} />
                  <span>{m.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. TOP SUMMARY METRIC CARDS (Section 5 & 14) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '14px' }}>
          
          {/* Card 1: ACTIVE SUBSCRIPTIONS */}
          <div style={{ background: '#FAFAF7', padding: '16px 18px', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '6px', letterSpacing: '0.04em' }}>
              Active Subscriptions
            </div>
            <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.1 }}>
              {activeSubscriptionsCount}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              subscriptions detected
            </div>
          </div>

          {/* Card 2: MONTHLY SUBSCRIPTION COST */}
          <div style={{ background: '#FAFAF7', padding: '16px 18px', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '6px', letterSpacing: '0.04em' }}>
              Monthly Subscription Cost
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.1 }}>
              {formatINR(monthlySubscriptionCost)} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>/ month</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Annual Subscription Cost: {formatINR(annualSubscriptionCost)}/yr
            </div>
          </div>

          {/* Card 3: RECURRING COMMITMENTS */}
          <div style={{ background: '#FAFAF7', padding: '16px 18px', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '6px', letterSpacing: '0.04em' }}>
              Recurring Commitments
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)', lineHeight: 1.1 }}>
              {formatINR(totalMonthlyRecurring)} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>/ month</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Rent, bills, subscriptions & SIP
            </div>
          </div>

          {/* Card 4: NEXT PAYMENT (Upcoming Renewals) */}
          <div style={{ background: '#FAFAF7', padding: '16px 18px', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>
                Next Payment
              </div>
              <span className="badge badge-emerald" style={{ fontSize: '0.66rem', padding: '1px 6px' }}>
                Upcoming Renewals
              </span>
            </div>

            {nextPaymentPrediction ? (
              <div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {nextPaymentPrediction.merchantName}
                </div>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary)', marginTop: '2px' }}>
                  {formatINR(nextPaymentPrediction.amount)} · {nextPaymentPrediction.isConfident ? nextPaymentPrediction.dateLabel : `Expected around ${nextPaymentPrediction.dateLabel}`}
                </div>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                  Not enough history
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  More payments needed to predict
                </div>
              </div>
            )}
          </div>

        </div>

        {/* 3. FILTER PILLS (Section 6) */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          marginTop: '20px', 
          paddingTop: '18px', 
          borderTop: '1px solid var(--border-color)' 
        }}>
          {/* Category Filter Pills with Live Data Counts */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto', paddingBottom: '2px' }}>
            {[
              { id: 'ALL', label: 'All', count: masterRecurring.length },
              { id: 'SUBSCRIPTIONS', label: 'Subscriptions', count: actualSubscriptions.length },
              { id: 'BILLS', label: 'Bills', count: recurringBills.length },
              { id: 'COMMITMENTS', label: 'Commitments', count: recurringCommitments.length },
              { id: 'OTHER', label: 'Other', count: otherRecurring.length }
            ].map(pill => {
              const isSelected = selectedFilter === pill.id;
              return (
                <button
                  key={pill.id}
                  onClick={() => setSelectedFilter(pill.id)}
                  style={{
                    background: isSelected ? 'var(--primary)' : '#FAFAF7',
                    color: isSelected ? '#FFFFFF' : 'var(--text-main)',
                    border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                    padding: '6px 14px',
                    borderRadius: '9999px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span>{pill.label}</span>
                  <span style={{
                    background: isSelected ? 'rgba(255,255,255,0.25)' : 'var(--border-color)',
                    color: isSelected ? '#FFFFFF' : 'var(--text-muted)',
                    fontSize: '0.68rem',
                    padding: '1px 6px',
                    borderRadius: '10px',
                    fontWeight: 700
                  }}>
                    {pill.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Input */}
          <div style={{ position: 'relative', minWidth: '240px', maxWidth: '320px', width: '100%' }}>
            <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search recurring merchant or category..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="input-text"
              style={{ paddingLeft: '34px', height: '34px', fontSize: '0.8rem', width: '100%' }}
            />
          </div>
        </div>

      </div>

      {/* 4. FALSE POSITIVE HANDLING / "NEEDS REVIEW" (Section 11) */}
      {activeUnconfirmed.length > 0 && (
        <div 
          className="glass-panel" 
          style={{ 
            padding: '20px 24px', 
            background: '#FFFDF5', 
            border: '1px solid #FDE68A', 
            borderRadius: '16px' 
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <AlertTriangle size={17} color="#D97706" />
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#92400E', margin: 0 }}>
              Needs Review ({activeUnconfirmed.length})
            </h3>
          </div>
          <p style={{ fontSize: '0.8rem', color: '#78350F', margin: '0 0 14px 0' }}>
            Repeated merchant spending was found, but transaction patterns are irregular. Confirm whether these are recurring commitments or normal repeated shopping.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
            {activeUnconfirmed.map(item => (
              <div 
                key={item.id}
                style={{ 
                  background: '#FFFFFF', 
                  border: '1px solid #FCD34D', 
                  borderRadius: '12px', 
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '10px'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <strong style={{ fontSize: '0.92rem', color: 'var(--text-main)' }}>{item.merchantName}</strong>
                    <span className="badge badge-muted" style={{ fontSize: '0.66rem' }}>{item.category}</span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                    {item.count} payments found: {item.amounts.map(a => formatINR(a)).join(', ')}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#B45309', fontStyle: 'italic' }}>
                    “{item.reason}”
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderTop: '1px solid #F3F4F6', paddingTop: '10px' }}>
                  <button
                    onClick={() => handleMarkNotRecurring(item.merchantName)}
                    className="btn btn-secondary btn-sm"
                    style={{ flex: 1, fontSize: '0.74rem', padding: '5px 8px' }}
                  >
                    Not Recurring
                  </button>
                  <button
                    onClick={() => handleMarkAsRecurring(item.merchantName)}
                    className="btn btn-primary btn-sm"
                    style={{ flex: 1, fontSize: '0.74rem', padding: '5px 8px' }}
                  >
                    Mark as Recurring
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. MAIN CONTENT ACCORDING TO VIEW MODE */}

      {/* 5A. TIMELINE VIEW: UPCOMING RECURRING PAYMENTS (Section 9) */}
      {viewMode === 'timeline' && (
        <div 
          className="glass-panel" 
          style={{ 
            padding: '24px 28px', 
            background: '#FFFFFF', 
            border: '1px solid var(--border-color)', 
            borderRadius: '20px' 
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>
                Upcoming Schedule
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', margin: '2px 0 0 0' }}>
                Upcoming Recurring Payments
              </h3>
            </div>
            <span className="badge badge-emerald" style={{ fontSize: '0.72rem' }}>
              {upcomingTimeline.length} Expected Payments
            </span>
          </div>

          {Object.keys(groupedTimeline).length === 0 ? (
            <div style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              No scheduled upcoming payments found.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {Object.entries(groupedTimeline).map(([monthTitle, entries]) => (
                <div key={monthTitle}>
                  <div style={{ 
                    fontSize: '0.76rem', 
                    fontWeight: 800, 
                    color: 'var(--text-muted)', 
                    letterSpacing: '0.06em', 
                    textTransform: 'uppercase',
                    marginBottom: '10px',
                    paddingBottom: '6px',
                    borderBottom: '1px solid var(--border-color)'
                  }}>
                    {monthTitle}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {entries.map(entry => (
                      <div 
                        key={entry.id}
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'space-between', 
                          padding: '12px 16px', 
                          background: '#FAFAF7', 
                          borderRadius: '12px',
                          border: '1px solid var(--border-color)',
                          flexWrap: 'wrap',
                          gap: '10px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                          <div style={{ 
                            background: '#FFFFFF', 
                            border: '1px solid var(--border-color)', 
                            borderRadius: '8px', 
                            padding: '6px 10px', 
                            textAlign: 'center',
                            minWidth: '58px'
                          }}>
                            <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--primary)' }}>
                              {entry.dayLabel}
                            </div>
                          </div>

                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <strong style={{ fontSize: '0.92rem', color: 'var(--text-main)' }}>
                                {entry.merchantName}
                              </strong>
                              <span className="badge badge-muted" style={{ fontSize: '0.66rem' }}>
                                {entry.classificationLabel}
                              </span>
                            </div>
                            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                              {entry.isConfident ? `Scheduled on schedule (${entry.frequencyLabel})` : `Expected around ${entry.dayLabel}`}
                            </div>
                          </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)' }}>
                            {formatINR(entry.amount)}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            {entry.frequencyLabel}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 5B. CARDS VIEW (Section 7 & 8) */}
      {viewMode === 'cards' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

          {/* SECTION 7: DETECTED SUBSCRIPTIONS (Category A) */}
          {(selectedFilter === 'ALL' || selectedFilter === 'SUBSCRIPTIONS') && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                    Detected Subscriptions
                  </h3>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
                    Entertainment, streaming, digital memberships & software licenses
                  </p>
                </div>
                <span className="badge badge-emerald" style={{ fontSize: '0.72rem' }}>
                  {actualSubscriptions.length} Active Subscriptions
                </span>
              </div>

              {actualSubscriptions.length === 0 ? (
                <div style={{ background: '#FFFFFF', padding: '24px', borderRadius: '14px', border: '1px solid var(--border-color)', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.84rem' }}>
                  No digital subscriptions detected from your transaction history.
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
                  {actualSubscriptions.map(sub => {
                    const isExpanded = expandedReasonId === sub.id;
                    const confidenceBadgeClass = sub.confidenceLabel === 'High confidence' 
                      ? 'badge-emerald' 
                      : (sub.confidenceLabel === 'Likely recurring' ? 'badge-muted' : 'badge-rose');

                    return (
                      <div 
                        key={sub.id}
                        className="glass-card"
                        style={{ 
                          padding: '20px', 
                          display: 'flex', 
                          flexDirection: 'column', 
                          justifyContent: 'space-between',
                          border: '1px solid var(--border-color)',
                          borderRadius: '16px',
                          background: '#FFFFFF'
                        }}
                      >
                        <div>
                          {/* Top row: Avatar, Name, Category & Confidence Label */}
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div className="icon-box-mint" style={{ width: '38px', height: '38px', borderRadius: '10px', fontWeight: 800, fontSize: '0.9rem' }}>
                                {sub.merchantName.charAt(0)}
                              </div>
                              <div>
                                <strong style={{ fontSize: '0.98rem', color: 'var(--text-main)', display: 'block' }}>
                                  {sub.merchantName}
                                </strong>
                                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                  {sub.category}
                                </span>
                              </div>
                            </div>

                            <span className={`badge ${confidenceBadgeClass}`} style={{ fontSize: '0.68rem', fontWeight: 700 }}>
                              {sub.confidenceLabel}
                            </span>
                          </div>

                          {/* Pricing & Cadence banner */}
                          <div style={{ 
                            background: '#FAFAF7', 
                            padding: '12px 14px', 
                            borderRadius: '10px', 
                            border: '1px solid var(--border-color)', 
                            marginBottom: '14px', 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center' 
                          }}>
                            <div>
                              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                                Amount
                              </div>
                              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
                                {formatINR(sub.currentPrice)} <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 500 }}>/ {sub.frequencyLabel.toLowerCase()}</span>
                              </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                                Frequency
                              </div>
                              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)' }}>
                                {sub.frequencyLabel}
                              </div>
                            </div>
                          </div>

                          {/* Payment history facts */}
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.76rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
                            <div>
                              <span>Last paid:</span> <strong style={{ color: 'var(--text-main)' }}>{formatShortDate(sub.lastBillingDate)}</strong>
                            </div>
                            <div>
                              <span>Next expected:</span> <strong style={{ color: 'var(--primary)' }}>{sub.isNextDateConfident ? formatShortDate(sub.nextEstimatedDate) : `Around ${formatShortDate(sub.nextEstimatedDate)}`}</strong>
                            </div>
                          </div>

                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                            Detected from {sub.occurrences} payments
                          </div>
                        </div>

                        {/* Accordion: Why was this detected? (Section 10) */}
                        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
                          <button
                            onClick={() => setExpandedReasonId(isExpanded ? null : sub.id)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: 'var(--primary)',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              width: '100%',
                              padding: '2px 0'
                            }}
                          >
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <HelpCircle size={13} />
                              Why was this detected?
                            </span>
                            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </button>

                          {isExpanded && (
                            <div style={{ 
                              marginTop: '8px', 
                              padding: '10px 12px', 
                              background: '#F5F7F5', 
                              borderRadius: '8px', 
                              fontSize: '0.74rem', 
                              color: 'var(--text-main)',
                              lineHeight: 1.5 
                            }}>
                              <div style={{ fontWeight: 700, marginBottom: '4px' }}>
                                Detected as recurring because:
                              </div>
                              <ul style={{ margin: 0, paddingLeft: '16px', color: 'var(--text-muted)' }}>
                                {sub.whyDetected ? sub.whyDetected.map((reason, idx) => (
                                  <li key={idx} style={{ marginBottom: '2px' }}>{reason}</li>
                                )) : (
                                  <>
                                    <li>Same merchant found {sub.occurrences} times</li>
                                    <li>Average amount: {formatINR(sub.averagePrice || sub.currentPrice)}</li>
                                    <li>Payments occur approximately every {sub.approxDays || 30} days</li>
                                    <li>Amount variation: {formatINR(sub.amountVariation || 0)}</li>
                                    <li>Last payment: {formatFullDate(sub.lastBillingDate)}</li>
                                  </>
                                )}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* SECTION 8: OTHER RECURRING PAYMENTS (Categories B, C, D) */}
          {(selectedFilter === 'ALL' || selectedFilter === 'BILLS' || selectedFilter === 'COMMITMENTS' || selectedFilter === 'OTHER') && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                    Other Recurring Payments
                  </h3>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
                    House rent, utilities, electricity, insurance & standing commitments
                  </p>
                </div>
                <span className="badge badge-muted" style={{ fontSize: '0.72rem' }}>
                  {recurringBills.length + recurringCommitments.length + otherRecurring.length} Commitments
                </span>
              </div>

              {((selectedFilter === 'BILLS' && recurringBills.length === 0) ||
                (selectedFilter === 'COMMITMENTS' && recurringCommitments.length === 0) ||
                (selectedFilter === 'OTHER' && otherRecurring.length === 0) ||
                (masterRecurring.filter(m => m.classification !== 'SUBSCRIPTION').length === 0)) ? (
                <div style={{ background: '#FFFFFF', padding: '24px', borderRadius: '14px', border: '1px solid var(--border-color)', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.84rem' }}>
                  No bills or commitments detected under this category.
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
                  {masterRecurring.filter(item => {
                    if (selectedFilter === 'BILLS') return item.classification === 'BILL';
                    if (selectedFilter === 'COMMITMENTS') return item.classification === 'COMMITMENT';
                    if (selectedFilter === 'OTHER') return item.classification === 'OTHER';
                    return item.classification !== 'SUBSCRIPTION';
                  }).map(item => {
                    const isExpanded = expandedReasonId === item.id;
                    const icon = getCategoryIcon(item.classification, item.category, item.merchantName);
                    const confidenceBadgeClass = item.confidenceLabel === 'High confidence' 
                      ? 'badge-emerald' 
                      : (item.confidenceLabel === 'Likely recurring' ? 'badge-muted' : 'badge-rose');

                    return (
                      <div 
                        key={item.id}
                        className="glass-card"
                        style={{ 
                          padding: '20px', 
                          display: 'flex', 
                          flexDirection: 'column', 
                          justifyContent: 'space-between',
                          border: '1px solid var(--border-color)',
                          borderRadius: '16px',
                          background: '#FFFFFF'
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div style={{ 
                                width: '38px', 
                                height: '38px', 
                                borderRadius: '10px', 
                                background: '#FAFAF7', 
                                border: '1px solid var(--border-color)',
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center' 
                              }}>
                                {icon}
                              </div>
                              <div>
                                <strong style={{ fontSize: '0.98rem', color: 'var(--text-main)', display: 'block' }}>
                                  {item.merchantName}
                                </strong>
                                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                  {item.classificationLabel} · {item.category}
                                </span>
                              </div>
                            </div>

                            <span className={`badge ${confidenceBadgeClass}`} style={{ fontSize: '0.68rem', fontWeight: 700 }}>
                              {item.confidenceLabel}
                            </span>
                          </div>

                          <div style={{ 
                            background: '#FAFAF7', 
                            padding: '12px 14px', 
                            borderRadius: '10px', 
                            border: '1px solid var(--border-color)', 
                            marginBottom: '14px', 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center' 
                          }}>
                            <div>
                              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                                Amount
                              </div>
                              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
                                {formatINR(item.currentPrice)} {item.amountVariation > 0 ? <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 500 }}>avg.</span> : null}
                              </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                                Cadence
                              </div>
                              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)' }}>
                                {item.frequencyLabel}
                              </div>
                            </div>
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.76rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
                            <div>
                              <span>Last transaction:</span> <strong style={{ color: 'var(--text-main)' }}>{formatShortDate(item.lastBillingDate)}</strong>
                            </div>
                            <div>
                              <span>Next expected:</span> <strong style={{ color: 'var(--primary)' }}>{item.isNextDateConfident ? formatShortDate(item.nextEstimatedDate) : `Around ${formatShortDate(item.nextEstimatedDate)}`}</strong>
                            </div>
                          </div>
                        </div>

                        {/* Accordion: Why was this detected? */}
                        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
                          <button
                            onClick={() => setExpandedReasonId(isExpanded ? null : item.id)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: 'var(--primary)',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              width: '100%',
                              padding: '2px 0'
                            }}
                          >
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <HelpCircle size={13} />
                              Why was this detected?
                            </span>
                            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </button>

                          {isExpanded && (
                            <div style={{ 
                              marginTop: '8px', 
                              padding: '10px 12px', 
                              background: '#F5F7F5', 
                              borderRadius: '8px', 
                              fontSize: '0.74rem', 
                              color: 'var(--text-main)',
                              lineHeight: 1.5 
                            }}>
                              <div style={{ fontWeight: 700, marginBottom: '4px' }}>
                                Detected as recurring because:
                              </div>
                              <ul style={{ margin: 0, paddingLeft: '16px', color: 'var(--text-muted)' }}>
                                {item.whyDetected ? item.whyDetected.map((reason, idx) => (
                                  <li key={idx} style={{ marginBottom: '2px' }}>{reason}</li>
                                )) : (
                                  <>
                                    <li>Same merchant found {item.occurrences} times</li>
                                    <li>Average amount: {formatINR(item.averagePrice || item.currentPrice)}</li>
                                    <li>Payments occur approximately every {item.approxDays || 30} days</li>
                                    <li>Amount variation: {formatINR(item.amountVariation || 0)}</li>
                                    <li>Last payment: {formatFullDate(item.lastBillingDate)}</li>
                                  </>
                                )}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

        </div>
      )}

      {/* 5C. TABLE VIEW */}
      {viewMode === 'table' && (
        <div className="glass-panel" style={{ padding: '0px', background: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: '18px', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
              <thead>
                <tr style={{ background: '#FAFAF7', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '14px 18px', fontWeight: 600 }}>MERCHANT / COMMITMENT</th>
                  <th style={{ padding: '14px 18px', fontWeight: 600 }}>CATEGORY</th>
                  <th style={{ padding: '14px 18px', fontWeight: 600 }}>FREQUENCY</th>
                  <th style={{ padding: '14px 18px', fontWeight: 600 }}>AMOUNT</th>
                  <th style={{ padding: '14px 18px', fontWeight: 600 }}>LAST PAID</th>
                  <th style={{ padding: '14px 18px', fontWeight: 600 }}>NEXT EXPECTED</th>
                  <th style={{ padding: '14px 18px', fontWeight: 600 }}>CONFIDENCE</th>
                </tr>
              </thead>
              <tbody>
                {displayedItems.map(item => (
                  <tr 
                    key={item.id}
                    onClick={() => setExpandedReasonId(expandedReasonId === item.id ? null : item.id)}
                    style={{ borderBottom: '1px solid var(--border-color)', cursor: 'pointer', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#F5F6F2'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div className="icon-box-mint" style={{ width: '30px', height: '30px', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 700 }}>
                          {item.merchantName.charAt(0)}
                        </div>
                        <div>
                          <strong style={{ color: 'var(--text-main)', display: 'block' }}>{item.merchantName}</strong>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{item.classificationLabel}</span>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <span className="badge badge-muted" style={{ fontSize: '0.7rem' }}>
                        {item.category}
                      </span>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <span className="badge badge-emerald" style={{ fontSize: '0.7rem' }}>
                        {item.frequencyLabel}
                      </span>
                    </td>
                    <td style={{ padding: '14px 18px', fontWeight: 700, color: 'var(--text-main)' }}>
                      {formatINR(item.currentPrice)}
                    </td>
                    <td style={{ padding: '14px 18px', color: 'var(--text-muted)' }}>
                      {formatShortDate(item.lastBillingDate)}
                    </td>
                    <td style={{ padding: '14px 18px', color: 'var(--primary)', fontWeight: 600 }}>
                      {item.isNextDateConfident ? formatShortDate(item.nextEstimatedDate) : `Around ${formatShortDate(item.nextEstimatedDate)}`}
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <span className={`badge ${item.confidenceLabel === 'High confidence' ? 'badge-emerald' : 'badge-muted'}`} style={{ fontSize: '0.68rem' }}>
                        {item.confidenceLabel}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. INSUFFICIENT DATA / SINGLE PAYMENT MERCHANTS (Section 13) */}
      {activeSinglePayments.length > 0 && (
        <div 
          className="glass-panel" 
          style={{ 
            padding: '16px 20px', 
            background: '#FFFFFF', 
            border: '1px solid var(--border-color)', 
            borderRadius: '14px' 
          }}
        >
          <div 
            onClick={() => setShowSinglePayments(!showSinglePayments)}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              cursor: 'pointer' 
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={16} color="var(--text-muted)" />
              <strong style={{ fontSize: '0.86rem', color: 'var(--text-main)' }}>
                Single Payments ({activeSinglePayments.length} merchants need more transaction history)
              </strong>
            </div>
            <button 
              style={{ background: 'transparent', border: 'none', color: 'var(--primary)', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              {showSinglePayments ? 'Hide Details' : 'View Merchants'}
              {showSinglePayments ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>

          {showSinglePayments && (
            <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid var(--border-color)' }}>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0 0 10px 0' }}>
                These merchants appeared only once in your uploaded history. A transaction is never assumed to be recurring from a single payment.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '8px' }}>
                {activeSinglePayments.slice(0, 8).map(sp => (
                  <div key={sp.id} style={{ background: '#FAFAF7', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.78rem' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{sp.merchantName}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {formatINR(sp.amount)} · One payment found
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
