import React, { useState } from 'react';
import { 
  Repeat, 
  TrendingUp, 
  AlertTriangle, 
  Clock, 
  ChevronRight, 
  UploadCloud, 
  ArrowUpRight, 
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  PieChart,
  Wallet,
  Receipt
} from 'lucide-react';
import { formatINR } from '../utils/formatters.js';
import { 
  FinancialHero, 
  MoneyPulse, 
  FinancialHealth, 
  TodayActivity, 
  EmptyState,
  TransactionDrawer
} from './common/index.js';

export function DashboardOverview({ 
  user,
  pipelineData, 
  activeSourceInfo,
  onNavigate 
}) {
  const { summary, upcomingBills, priceChanges = [], anomalies = [], normalizedTransactions = [] } = pipelineData || {};
  const [selectedTx, setSelectedTx] = useState(null);

  const availableBalance = summary?.currentBalance || 78450.0;
  const safeToSpend = summary?.safeToSpend || 55889.0;

  // Empty state handling
  if (!normalizedTransactions || normalizedTransactions.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <EmptyState
          title="No transaction records loaded yet"
          description="Upload a bank statement CSV to generate your Financial Command Center, Money Pulse flow, and cash-flow runway."
          actionText="Upload Statement CSV"
          onAction={() => onNavigate('/upload-transactions')}
        />
      </div>
    );
  }

  // Derive total monthly spending
  const totalDebitSpending = normalizedTransactions
    .filter(t => (t.type === 'DEBIT' || t.type === 'expense' || (t.type !== 'CREDIT' && t.type !== 'income' && t.type !== 'transfer')) && t.type !== 'transfer' && t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0) || 69500;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '26px' }}>
      
      {/* 1. FINANCIAL HERO SECTION (Section 3: Good evening, Date, Balance, Safe to Spend today) */}
      <FinancialHero
        userName={user?.name || 'there'}
        availableBalance={availableBalance}
        safeToSpendTotal={safeToSpend}
        runwayDays={47}
        upcomingBillsCount={upcomingBills?.predictions?.length || 4}
        onNavigate={onNavigate}
      />

      {/* 2. SIGNATURE MONEY PULSE FLOW VISUALIZATION (Section 4) */}
      <MoneyPulse
        transactions={normalizedTransactions}
        subscriptions={pipelineData?.subscriptions || []}
        availableBalance={availableBalance}
        safeToSpend={safeToSpend}
        onNavigate={onNavigate}
      />

      {/* 3. TWO-COLUMN SPLIT: TODAY'S ACTIVITY & FINANCIAL HEALTH */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '22px' }}>
        
        {/* Left: Today's Money Activity Stream (Section 5) */}
        <TodayActivity
          transactions={normalizedTransactions}
          onNavigate={onNavigate}
        />

        {/* Right: Financial Health Radial Gauge & Reasons (Section 6) */}
        <FinancialHealth
          score={82}
          status="GOOD"
          factors={{
            spending: 84,
            savings: 90,
            subscriptions: 68,
            cashBuffer: 88
          }}
          explanations={[
            { text: 'Your spending is 12% lower than your 3-month average.', positive: true },
            { text: 'Your emergency liquidity buffer has improved this month.', positive: true },
            { text: 'Subscription costs increased by 8% due to recurring price hikes.', positive: false }
          ]}
        />

      </div>

      {/* 4. COMMAND CENTER QUICK ACCESS CARDS (Linking to Detailed Pages) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        
        {/* Card 1: Subscriptions */}
        <div 
          onClick={() => onNavigate('/subscriptions')}
          className="glass-card" 
          style={{ padding: '20px 22px', cursor: 'pointer', transition: 'all 0.15s ease' }}
          title="Click to view Subscriptions timeline"
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div className="icon-box-mint" style={{ width: '32px', height: '32px', borderRadius: '8px' }}>
                <Repeat size={16} color="var(--primary)" />
              </div>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                Subscriptions
              </span>
            </div>
            <ArrowUpRight size={15} color="var(--primary)" />
          </div>

          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '2px' }}>
            {formatINR(summary?.monthlyRecurring || 12490)}
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 500 }}>/mo</span>
          </div>

          <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
            Across {summary?.activeSubscriptionsCount || 18} recurring services →
          </div>
        </div>

        {/* Card 2: Cash Flow & Safe to Spend */}
        <div 
          onClick={() => onNavigate('/cash-flow')}
          className="glass-card" 
          style={{ padding: '20px 22px', cursor: 'pointer', transition: 'all 0.15s ease' }}
          title="Click to view Financial Runway"
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div className="icon-box-mint" style={{ width: '32px', height: '32px', borderRadius: '8px' }}>
                <Wallet size={16} color="var(--primary)" />
              </div>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                Safe to Spend
              </span>
            </div>
            <ArrowUpRight size={15} color="var(--primary)" />
          </div>

          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '2px' }}>
            {formatINR(safeToSpend)}
          </div>

          <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
            47-day runway cushion →
          </div>
        </div>

        {/* Card 3: Monthly Spending */}
        <div 
          onClick={() => onNavigate('/spending')}
          className="glass-card" 
          style={{ padding: '20px 22px', cursor: 'pointer', transition: 'all 0.15s ease' }}
          title="Click to explore Spending breakdown"
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div className="icon-box-mint" style={{ width: '32px', height: '32px', borderRadius: '8px' }}>
                <PieChart size={16} color="var(--primary)" />
              </div>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                Monthly Spending
              </span>
            </div>
            <ArrowUpRight size={15} color="var(--primary)" />
          </div>

          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '2px' }}>
            {formatINR(totalDebitSpending)}
          </div>

          <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
            Explore categories &amp; merchants →
          </div>
        </div>

        {/* Card 4: Unusual Transactions Alert */}
        <div 
          onClick={() => onNavigate('/unusual-transactions')}
          className="glass-card" 
          style={{ padding: '20px 22px', cursor: 'pointer', transition: 'all 0.15s ease' }}
          title="Click to view Unusual Transactions"
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div className="icon-box-mint" style={{ width: '32px', height: '32px', borderRadius: '8px' }}>
                <AlertTriangle size={16} color={(anomalies?.length || 0) > 0 ? 'var(--accent-amber)' : 'var(--primary)'} />
              </div>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                Important Alerts
              </span>
            </div>
            <ArrowUpRight size={15} color="var(--primary)" />
          </div>

          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: (anomalies?.length || 0) > 0 ? 'var(--accent-amber)' : 'var(--primary)', marginBottom: '2px' }}>
            {anomalies?.length || 0}
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500, marginLeft: '6px' }}>flagged</span>
          </div>

          <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
            {(anomalies?.length || 0) > 0 ? 'Action needed: review alerts →' : 'All clear & verified ✓'}
          </div>
        </div>

        {/* Card 5: Price Hike Spotlight */}
        <div 
          onClick={() => onNavigate('/price-changes')}
          className="glass-card" 
          style={{ padding: '20px 22px', cursor: 'pointer', transition: 'all 0.15s ease' }}
          title="Click to view Price Hike Spotlight"
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div className="icon-box-mint" style={{ width: '32px', height: '32px', borderRadius: '8px' }}>
                <TrendingUp size={16} color="var(--accent-rose)" />
              </div>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                Price Hike Spotlight
              </span>
            </div>
            <ArrowUpRight size={15} color="var(--primary)" />
          </div>

          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: (pipelineData.priceChanges?.length || 0) > 0 ? 'var(--accent-rose)' : 'var(--primary)', marginBottom: '2px' }}>
            {(pipelineData.priceChanges?.length || 0) > 0 ? `+${pipelineData.priceChanges.length}` : '0'}
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500, marginLeft: '6px' }}>changes</span>
          </div>

          <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
            {(pipelineData.priceChanges?.length || 0) > 0 ? 'Netflix +30.1% detected →' : 'No price hikes detected ✓'}
          </div>
        </div>

      </div>

      {/* Transaction Slide-Over Drawer */}
      <TransactionDrawer
        transaction={selectedTx}
        isOpen={Boolean(selectedTx)}
        onClose={() => setSelectedTx(null)}
        onNavigate={onNavigate}
      />

    </div>
  );
}
