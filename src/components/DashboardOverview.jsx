import React, { useState, useMemo } from 'react';
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
  Receipt,
  Lightbulb
} from 'lucide-react';
import { formatINR } from '../utils/formatters.js';
import { getDashboardViewModel } from '../services/engine/dashboardViewModel.js';
import { 
  FinancialHero, 
  MoneyPulse, 
  FinancialHealth, 
  TodayActivity, 
  EmptyState, 
  TransactionDrawer,
  CashFlowCard,
  SpendingCategoriesCard,
  UpcomingPaymentsCard,
  RecentTransactionsCard,
  InsightCard
} from './common/index.js';

export function DashboardOverview({ 
  user, 
  pipelineData, 
  activeSourceInfo, 
  onNavigate 
}) {
  const [selectedTx, setSelectedTx] = useState(null);
  const [cashFlowPeriod, setCashFlowPeriod] = useState('THIS_MONTH');

  // Derive complete, data-driven view model through the transformation layer
  const vm = useMemo(() => {
    return getDashboardViewModel(pipelineData, activeSourceInfo, { period: cashFlowPeriod });
  }, [pipelineData, activeSourceInfo, cashFlowPeriod]);

  const { summary, anomalies = [] } = pipelineData || {};

  // 1. EMPTY STATE HANDLING (Section 11)
  if (vm.isEmpty || !pipelineData?.normalizedTransactions || pipelineData.normalizedTransactions.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <EmptyState
          title="No transaction records loaded yet"
          description="Upload your bank statement CSV to generate your Financial Command Center, dynamic cash flow, and spending intelligence."
          actionText="Upload Statement CSV"
          onAction={() => onNavigate && onNavigate('/upload-transactions')}
        />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '26px' }}>
      
      {/* 1. PRIMARY FINANCIAL HERO (Section 1 & 2: Balance, Income, Spending, Savings, Savings Rate) */}
      <FinancialHero
        userName={user?.name || 'there'}
        availableBalance={vm.hero.availableBalance}
        monthlyIncome={vm.hero.monthlyIncome}
        monthlySpending={vm.hero.monthlySpending}
        monthlySavings={vm.hero.monthlySavings}
        savingsRate={vm.hero.savingsRate}
        safeToSpendTotal={vm.hero.safeToSpendTotal}
        runwayDays={vm.hero.runwayDays}
        comparison={vm.hero.comparison}
        periodLabel={vm.currentPeriodLabel}
        onNavigate={onNavigate}
      />

      {/* 2. COMMAND CENTER QUICK ACCESS SUMMARY CARDS (Multi-page Routes Hub) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '14px' }}>
        
        {/* Card 1: Subscriptions */}
        <div 
          onClick={() => onNavigate && onNavigate('/subscriptions')}
          className="glass-card" 
          style={{ padding: '18px 20px', cursor: 'pointer', transition: 'all 0.15s ease' }}
          title="Click to view Recurring Payments"
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div className="icon-box-mint" style={{ width: '30px', height: '30px', borderRadius: '8px' }}>
                <Repeat size={15} color="var(--primary)" />
              </div>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                Subscriptions
              </span>
            </div>
            <ArrowUpRight size={14} color="var(--primary)" />
          </div>

          <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '2px' }}>
            {formatINR(summary?.monthlyRecurring || 12490)}
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 500 }}>/mo</span>
          </div>

          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
            Across {summary?.activeSubscriptionsCount || pipelineData?.subscriptions?.length || 6} recurring services →
          </div>
        </div>

        {/* Card 2: Cash Flow & Safe to Spend */}
        <div 
          onClick={() => onNavigate && onNavigate('/cash-flow')}
          className="glass-card" 
          style={{ padding: '18px 20px', cursor: 'pointer', transition: 'all 0.15s ease' }}
          title="Click to view Cash Flow Runway"
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div className="icon-box-mint" style={{ width: '30px', height: '30px', borderRadius: '8px' }}>
                <Wallet size={15} color="var(--primary)" />
              </div>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                Safe to Spend
              </span>
            </div>
            <ArrowUpRight size={14} color="var(--primary)" />
          </div>

          <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '2px' }}>
            {formatINR(vm.hero.safeToSpendTotal)}
          </div>

          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
            {vm.hero.runwayDays}-day runway cushion →
          </div>
        </div>

        {/* Card 3: Monthly Spending */}
        <div 
          onClick={() => onNavigate && onNavigate('/spending')}
          className="glass-card" 
          style={{ padding: '18px 20px', cursor: 'pointer', transition: 'all 0.15s ease' }}
          title="Click to explore Spending breakdown"
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div className="icon-box-mint" style={{ width: '30px', height: '30px', borderRadius: '8px' }}>
                <PieChart size={15} color="var(--primary)" />
              </div>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                Monthly Spending
              </span>
            </div>
            <ArrowUpRight size={14} color="var(--primary)" />
          </div>

          <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '2px' }}>
            {formatINR(vm.hero.monthlySpending)}
          </div>

          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
            Explore categories &amp; merchants →
          </div>
        </div>

        {/* Card 4: Important Alerts */}
        <div 
          onClick={() => onNavigate && onNavigate('/unusual-transactions')}
          className="glass-card" 
          style={{ padding: '18px 20px', cursor: 'pointer', transition: 'all 0.15s ease' }}
          title="Click to view Unusual Transactions"
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div className="icon-box-mint" style={{ width: '30px', height: '30px', borderRadius: '8px' }}>
                <AlertTriangle size={15} color={(anomalies?.length || 0) > 0 ? 'var(--accent-amber)' : 'var(--primary)'} />
              </div>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                Important Alerts
              </span>
            </div>
            <ArrowUpRight size={14} color="var(--primary)" />
          </div>

          <div style={{ fontSize: '1.45rem', fontWeight: 800, color: (anomalies?.length || 0) > 0 ? 'var(--accent-amber)' : 'var(--primary)', marginBottom: '2px' }}>
            {anomalies?.length || 0}
            <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: 500, marginLeft: '6px' }}>flagged</span>
          </div>

          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
            {(anomalies?.length || 0) > 0 ? 'Action needed: review alerts →' : 'All clear & verified ✓'}
          </div>
        </div>

        {/* Card 5: Price Hike Spotlight */}
        <div 
          onClick={() => onNavigate && onNavigate('/price-changes')}
          className="glass-card" 
          style={{ padding: '18px 20px', cursor: 'pointer', transition: 'all 0.15s ease' }}
          title="Click to view Price Hike Spotlight"
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div className="icon-box-mint" style={{ width: '30px', height: '30px', borderRadius: '8px' }}>
                <TrendingUp size={15} color="var(--accent-rose)" />
              </div>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                Price Hike Spotlight
              </span>
            </div>
            <ArrowUpRight size={14} color="var(--primary)" />
          </div>

          <div style={{ fontSize: '1.45rem', fontWeight: 800, color: (pipelineData.priceChanges?.length || 0) > 0 ? 'var(--accent-rose)' : 'var(--primary)', marginBottom: '2px' }}>
            {(pipelineData.priceChanges?.length || 0) > 0 ? `+${pipelineData.priceChanges.length}` : '0'}
            <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: 500, marginLeft: '6px' }}>changes</span>
          </div>

          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
            {(pipelineData.priceChanges?.length || 0) > 0 ? 'Recurring price changes detected →' : 'No price hikes detected ✓'}
          </div>
        </div>

      </div>

      {/* 3. TWO-COLUMN SPLIT: CASH FLOW & FINANCIAL HEALTH (Section 5 & 6) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '22px' }}>
        
        {/* Left: Interactive Cash Flow & Net Movement Visualization (Section 6) */}
        <CashFlowCard
          cashFlowData={vm.cashFlow}
          activePeriod={cashFlowPeriod}
          onPeriodChange={setCashFlowPeriod}
          onNavigate={onNavigate}
        />

        {/* Right: Dynamic Financial Health Gauge & Intelligence (Section 5) */}
        <FinancialHealth
          score={vm.health.score}
          status={vm.health.status}
          factors={vm.health.factors}
          explanations={vm.health.explanations}
        />

      </div>

      {/* 4. TWO-COLUMN SPLIT: SPENDING BY CATEGORY & UPCOMING PAYMENTS (Section 7 & 8) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '22px' }}>
        
        {/* Left: Top Spending Categories with Progress Bars & Counts (Section 7) */}
        <SpendingCategoriesCard
          categories={vm.spending.categories}
          totalSpending={vm.spending.totalSpending}
          onNavigate={onNavigate}
        />

        {/* Right: Upcoming Recurring Payments from Recurrence Engine (Section 8) */}
        <UpcomingPaymentsCard
          upcomingPayments={vm.upcoming}
          onNavigate={onNavigate}
        />

      </div>

      {/* 5. PERSONALIZED DATA-DRIVEN INSIGHTS (Section 10) */}
      {vm.insights.length > 0 && (
        <div className="glass-panel" style={{ padding: '26px 28px', background: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div className="icon-box-mint" style={{ width: '32px', height: '32px', borderRadius: '8px' }}>
                <Lightbulb size={16} color="var(--primary)" />
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, letterSpacing: '-0.02em' }}>
                  Personalized Financial Insights
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                  Actionable observations derived from your actual transaction activity
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onNavigate && onNavigate('/insights')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.76rem', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <span>All Insights</span>
              <ChevronRight size={13} />
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
            {vm.insights.slice(0, 3).map((ins) => (
              <InsightCard
                key={ins.id}
                insight={ins}
                onAction={(route) => onNavigate && onNavigate(route)}
              />
            ))}
          </div>
        </div>
      )}

      {/* 6. RECENT ACTIVITY: COMPACT TRANSACTION LIST (Section 9) */}
      <RecentTransactionsCard
        transactions={vm.recentTransactions}
        onSelectTransaction={(tx) => setSelectedTx(tx)}
        onNavigate={onNavigate}
      />

      {/* 7. SLIDE-OVER TRANSACTION DRAWER (Section 9) */}
      <TransactionDrawer
        transaction={selectedTx}
        isOpen={Boolean(selectedTx)}
        onClose={() => setSelectedTx(null)}
        onNavigate={onNavigate}
      />

    </div>
  );
}
