import React, { useState, useMemo, useRef } from 'react';
import { 
  FileText, 
  Download, 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight, 
  ArrowDownRight, 
  Repeat, 
  AlertTriangle, 
  CheckCircle2, 
  X, 
  Layers, 
  Calendar, 
  PieChart, 
  ChevronRight,
  ShieldCheck,
  CreditCard
} from 'lucide-react';
import { formatINR, formatIndianNumber } from '../utils/formatters.js';
import { generateSpendingReportPdf } from '../services/reports/reportPdfGenerator.js';
import { CategoryExplorer, EmptyState } from './common/index.js';

export function SpendingSummaryView({ 
  user, 
  connectedBank, 
  transactions = [], 
  subscriptions = [], 
  allAnomalies = [], 
  reviewedAnomalyIds = [], 
  onNavigate 
}) {
  const [toastMessage, setToastMessage] = useState(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const toastTimeoutRef = useRef(null);

  // Compute all metrics from actual transaction data
  const summaryData = useMemo(() => {
    if (!transactions || transactions.length === 0) {
      return null;
    }

    const isCredit = (t) => t.type === 'CREDIT' || t.type === 'income' || t.canonical_type === 'income';
    const isDebit = (t) => (t.type === 'DEBIT' || t.type === 'expense' || t.canonical_type === 'expense' || (t.type !== 'CREDIT' && t.type !== 'income' && t.type !== 'transfer')) && t.type !== 'transfer';

    const debits = transactions.filter(t => isDebit(t) && t.amount > 0);
    const credits = transactions.filter(t => isCredit(t) && t.amount > 0);

    const totalSpending = debits.reduce((sum, t) => sum + t.amount, 0);
    const totalIncome = credits.reduce((sum, t) => sum + t.amount, 0);
    const netCashFlow = totalIncome - totalSpending;
    const transactionCount = transactions.length;

    // Category breakdown
    const categoryMap = {};
    debits.forEach(t => {
      const cat = t.category || 'Other';
      if (!categoryMap[cat]) {
        categoryMap[cat] = { name: cat, total: 0, count: 0 };
      }
      categoryMap[cat].total += t.amount;
      categoryMap[cat].count += 1;
    });

    const categories = Object.values(categoryMap).map(c => ({
      ...c,
      percentage: totalSpending > 0 ? (c.total / totalSpending) * 100 : 0
    })).sort((a, b) => b.total - a.total);

    const topCategory = categories[0] || { name: 'None', total: 0, count: 0, percentage: 0 };

    // Highest individual transaction
    const highestTransaction = debits.reduce((max, t) => (t.amount > (max?.amount || 0) ? t : max), null);

    // Subscription spending (monthly committed)
    const monthlySubscriptionCommitted = subscriptions.reduce((sum, s) => sum + (s.normalizedMonthly || s.amount || 0), 0);
    const subscriptionsCount = subscriptions.length;

    // Monthly spending trend
    const monthMap = {};
    transactions.forEach(t => {
      if (!t.date) return;
      const monthKey = t.date.substring(0, 7); // YYYY-MM
      if (!monthMap[monthKey]) {
        monthMap[monthKey] = { monthKey, spending: 0, income: 0, count: 0 };
      }
      if (isCredit(t)) {
        monthMap[monthKey].income += t.amount;
      } else if (isDebit(t)) {
        monthMap[monthKey].spending += t.amount;
      }
      monthMap[monthKey].count += 1;
    });

    const monthlyTrend = Object.values(monthMap).sort((a, b) => a.monthKey.localeCompare(b.monthKey)).map(m => {
      const [year, month] = m.monthKey.split('-');
      const dateObj = new Date(Number(year), Number(month) - 1, 1);
      const label = dateObj.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      return {
        ...m,
        label,
        net: m.income - m.spending
      };
    });

    // Alerts summary
    const reviewedSet = new Set(reviewedAnomalyIds);
    const totalAlerts = allAnomalies.length;
    const duplicateAlerts = allAnomalies.filter(a => a.type === 'DUPLICATE_TRANSACTION').length;
    const unusualSpikeAlerts = allAnomalies.filter(a => a.type === 'UNUSUAL_AMOUNT').length;
    const reviewedAlerts = allAnomalies.filter(a => reviewedSet.has(a.id)).length;
    const pendingAlerts = allAnomalies.filter(a => !reviewedSet.has(a.id)).length;

    // Top 5 largest individual expenses
    const topTransactions = [...debits].sort((a, b) => b.amount - a.amount).slice(0, 5);

    // Key financial insights
    const insights = [];
    if (totalIncome > 0) {
      const savingsRate = Math.round(((totalIncome - totalSpending) / totalIncome) * 100);
      if (savingsRate > 0) {
        insights.push(`Positive net cash flow of ${formatINR(netCashFlow)} represents a ${savingsRate}% savings margin.`);
      } else {
        insights.push(`Spending exceeded total income by ${formatINR(Math.abs(netCashFlow))} across the recorded period.`);
      }
    }
    if (topCategory.total > 0) {
      insights.push(`Your top spending category is ${topCategory.name} totaling ${formatINR(topCategory.total)} (${topCategory.percentage.toFixed(1)}% of total outflows).`);
    }
    if (subscriptionsCount > 0) {
      insights.push(`${subscriptionsCount} active subscriptions represent ${formatINR(monthlySubscriptionCommitted)}/mo in recurring commitments.`);
    }
    if (pendingAlerts > 0) {
      insights.push(`${pendingAlerts} unusual transaction alert(s) remain pending review for potential duplicate or outlier charges.`);
    } else {
      insights.push(`All ${totalAlerts} unusual transaction alerts have been reviewed and verified.`);
    }

    return {
      totalSpending,
      totalIncome,
      netCashFlow,
      transactionCount,
      categories,
      topCategory,
      highestTransaction,
      monthlySubscriptionCommitted,
      subscriptionsCount,
      subscriptions,
      monthlyTrend,
      alertsSummary: {
        totalAlerts,
        duplicateAlerts,
        unusualSpikeAlerts,
        reviewedAlerts,
        pendingAlerts
      },
      topTransactions,
      insights
    };
  }, [transactions, subscriptions, allAnomalies, reviewedAnomalyIds]);

  const triggerToast = (msg) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage(msg);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleDownloadReport = () => {
    if (!summaryData) return;

    try {
      setIsGeneratingPdf(true);
      generateSpendingReportPdf({
        user,
        connectedBank,
        summaryData
      });
      triggerToast('Spending report downloaded successfully.');
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      alert('Could not generate the PDF report. Please try again.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // EMPTY STATE (No transaction data available - Section 16)
  if (!summaryData || transactions.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div className="glass-panel" style={{ padding: '24px', background: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="icon-box-mint">
              <FileText size={20} color="var(--primary)" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.35rem', color: 'var(--text-main)', margin: 0, fontWeight: 800 }}>
                Spending <span style={{ color: 'var(--primary)' }}>Analysis</span>
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                Categorical breakdown, merchant intelligence, and exportable statements
              </p>
            </div>
          </div>
        </div>

        <EmptyState
          title="No spending categories yet"
          description="Import your transactions to start seeing where your money goes across food, shopping, utilities, and lifestyle categories."
          actionText="Upload Transactions"
          onAction={() => onNavigate('/upload-transactions')}
          secondaryActionText="Connect Bank Account"
          onSecondaryAction={() => onNavigate('/connect-bank')}
        />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* 1. HEADER WITH PROMINENT DOWNLOAD BUTTON */}
      <div className="glass-panel" style={{ padding: '24px 28px', background: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="icon-box-mint" style={{ width: '42px', height: '42px', borderRadius: '12px' }}>
              <FileText size={22} color="var(--primary)" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.35rem', color: 'var(--text-main)', margin: 0, fontWeight: 800, letterSpacing: '-0.025em' }}>
                Spending Summary &amp; <span className="text-forest">Reports</span>
              </h2>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', margin: 0 }}>
                Comprehensive spending breakdown, recurring overhead, and exportable PDF statement
              </p>
            </div>
          </div>

          <button 
            onClick={handleDownloadReport}
            disabled={isGeneratingPdf}
            className="btn btn-primary btn-lg"
            style={{ boxShadow: '0 4px 14px rgba(24, 118, 90, 0.25)' }}
            id="download-spending-report-btn"
          >
            <Download size={17} />
            <span>{isGeneratingPdf ? 'Generating PDF...' : 'Download Report (PDF)'}</span>
          </button>
        </div>
      </div>

      {/* 2. SPENDING SUMMARY UI - 8 KEY METRICS GRID */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '16px'
      }}>
        {/* Metric 1: Total Spending */}
        <div className="glass-card" style={{ padding: '20px', background: '#FFFFFF' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>
              Total Spending
            </span>
            <div className="icon-box-mint" style={{ width: '28px', height: '28px', borderRadius: '6px' }}>
              <ArrowDownRight size={15} color="var(--primary)" />
            </div>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px' }}>
            {formatINR(summaryData.totalSpending)}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Across all debits in period
          </div>
        </div>

        {/* Metric 2: Total Income */}
        <div className="glass-card" style={{ padding: '20px', background: '#FFFFFF' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>
              Total Income
            </span>
            <div className="icon-box-mint" style={{ width: '28px', height: '28px', borderRadius: '6px' }}>
              <ArrowUpRight size={15} color="var(--primary)" />
            </div>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '4px' }}>
            {formatINR(summaryData.totalIncome)}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Salary &amp; electronic credits
          </div>
        </div>

        {/* Metric 3: Net Cash Flow */}
        <div className="glass-card" style={{ padding: '20px', background: '#FFFFFF' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>
              Net Cash Flow
            </span>
            <span className={`badge ${summaryData.netCashFlow >= 0 ? 'badge-emerald' : 'badge-rose'}`} style={{ fontSize: '0.68rem' }}>
              {summaryData.netCashFlow >= 0 ? 'Surplus' : 'Deficit'}
            </span>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: summaryData.netCashFlow >= 0 ? 'var(--primary)' : 'var(--accent-rose)', marginBottom: '4px' }}>
            {summaryData.netCashFlow >= 0 ? '+' : ''}{formatINR(summaryData.netCashFlow)}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Income minus expenses
          </div>
        </div>

        {/* Metric 4: Number of Transactions */}
        <div className="glass-card" style={{ padding: '20px', background: '#FFFFFF' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>
              Transactions
            </span>
            <div className="icon-box-mint" style={{ width: '28px', height: '28px', borderRadius: '6px' }}>
              <CreditCard size={15} color="var(--primary)" />
            </div>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px' }}>
            {summaryData.transactionCount}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Total statement entries
          </div>
        </div>

        {/* Metric 5: Top Spending Category */}
        <div className="glass-card" style={{ padding: '20px', background: '#FFFFFF' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>
              Top Category
            </span>
            <div className="icon-box-mint" style={{ width: '28px', height: '28px', borderRadius: '6px' }}>
              <PieChart size={15} color="var(--primary)" />
            </div>
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {summaryData.topCategory.name}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            {formatINR(summaryData.topCategory.total)} ({summaryData.topCategory.percentage.toFixed(1)}%)
          </div>
        </div>

        {/* Metric 6: Highest Transaction */}
        <div className="glass-card" style={{ padding: '20px', background: '#FFFFFF' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>
              Highest Expense
            </span>
            <span className="badge badge-amber" style={{ fontSize: '0.66rem' }}>Outlier</span>
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-amber)', marginBottom: '4px' }}>
            {formatINR(summaryData.highestTransaction?.amount || 0)}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {summaryData.highestTransaction?.cleanMerchant || 'None'} • {summaryData.highestTransaction?.date || ''}
          </div>
        </div>

        {/* Metric 7: Subscription Spending */}
        <div className="glass-card" style={{ padding: '20px', background: '#FFFFFF' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>
              Subscriptions
            </span>
            <div className="icon-box-mint" style={{ width: '28px', height: '28px', borderRadius: '6px' }}>
              <Repeat size={15} color="var(--primary)" />
            </div>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px' }}>
            {formatINR(summaryData.monthlySubscriptionCommitted)}
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>/mo</span>
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Across {summaryData.subscriptionsCount} active subscriptions
          </div>
        </div>

        {/* Metric 8: Unusual Transactions / Alerts */}
        <div 
          onClick={() => onNavigate('/anomalies')}
          className="glass-card" 
          style={{ padding: '20px', background: '#FFFFFF', cursor: 'pointer' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>
              Alerts &amp; Outliers
            </span>
            <span className={`badge ${summaryData.alertsSummary.pendingAlerts > 0 ? 'badge-amber' : 'badge-emerald'}`} style={{ fontSize: '0.66rem' }}>
              {summaryData.alertsSummary.pendingAlerts > 0 ? `${summaryData.alertsSummary.pendingAlerts} Pending` : 'All Reviewed'}
            </span>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: summaryData.alertsSummary.pendingAlerts > 0 ? 'var(--accent-amber)' : 'var(--primary)', marginBottom: '4px' }}>
            {summaryData.alertsSummary.totalAlerts} Flagged
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            {summaryData.alertsSummary.duplicateAlerts} duplicates, {summaryData.alertsSummary.unusualSpikeAlerts} outliers
          </div>
        </div>
      </div>

      {/* 3. TWO-COLUMN: CATEGORY BREAKDOWN & MONTHLY TREND */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))', gap: '20px' }}>
        
        {/* LEFT: CATEGORY BREAKDOWN */}
        <div className="glass-panel" style={{ padding: '24px', background: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div className="icon-box-mint">
                <PieChart size={18} color="var(--primary)" />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, letterSpacing: '-0.02em' }}>
                Spending by Category
              </h3>
            </div>
            <span className="badge badge-emerald">
              {summaryData.categories.length} Categories
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {summaryData.categories.map((cat, idx) => (
              <div key={idx} style={{ background: '#FAFAF7', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '14px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <strong style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>{cat.name}</strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>({cat.count} tx)</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <strong style={{ fontSize: '0.92rem', color: 'var(--text-main)' }}>{formatINR(cat.total)}</strong>
                    <span style={{ fontSize: '0.76rem', color: 'var(--primary)', fontWeight: 600, marginLeft: '8px' }}>
                      {cat.percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Visual Progress Bar */}
                <div style={{ width: '100%', height: '6px', background: '#E4E9E3', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${Math.min(100, Math.max(3, cat.percentage))}%`,
                    height: '100%',
                    background: 'var(--primary)',
                    borderRadius: '4px',
                    transition: 'width 0.3s ease'
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: MONTHLY SPENDING TREND */}
        <div className="glass-panel" style={{ padding: '24px', background: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div className="icon-box-mint">
                <Calendar size={18} color="var(--primary)" />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, letterSpacing: '-0.02em' }}>
                Monthly Spending Trend
              </h3>
            </div>
            <span className="badge badge-emerald">
              {summaryData.monthlyTrend.length} Months Tracked
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {summaryData.monthlyTrend.map((m, idx) => (
              <div 
                key={idx}
                style={{
                  background: '#FAFAF7',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  padding: '14px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}
              >
                <div>
                  <strong style={{ fontSize: '0.95rem', color: 'var(--text-main)' }}>{m.label}</strong>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {m.count} transactions recorded
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Spending</div>
                    <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-main)' }}>
                      {formatINR(m.spending)}
                    </div>
                  </div>

                  {m.income > 0 && (
                    <div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Income</div>
                      <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--primary)' }}>
                        {formatINR(m.income)}
                      </div>
                    </div>
                  )}

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Net Cash</div>
                    <div style={{ 
                      fontSize: '0.92rem', 
                      fontWeight: 700, 
                      color: m.net >= 0 ? 'var(--primary)' : 'var(--accent-rose)' 
                    }}>
                      {m.net >= 0 ? '+' : ''}{formatINR(m.net)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 4. INTERACTIVE CATEGORY VISUALIZATION & DRILL-DOWN (Section 11) */}
      <div className="glass-panel" style={{ padding: '28px', background: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: '18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <div className="icon-box-mint">
                <PieChart size={18} color="var(--primary)" />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, letterSpacing: '-0.02em' }}>
                Interactive Category <span style={{ color: 'var(--primary)' }}>Explorer</span>
              </h3>
            </div>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', margin: 0 }}>
              Deep dive into multi-level spending breakdown. Click any category to reveal subcategories (e.g. Restaurants, Groceries, Delivery, Cafes) and drill down into individual transactions.
            </p>
          </div>
        </div>

        <CategoryExplorer 
          transactions={transactions} 
          onSelectTransaction={() => onNavigate && onNavigate('/transactions')} 
        />
      </div>

      {/* 5. ALERTS SUMMARY SECTION & TOP 5 TRANSACTIONS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))', gap: '20px' }}>
        
        {/* ALERTS SUMMARY CARD */}
        <div className="glass-panel" style={{ padding: '24px', background: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div className="icon-box-mint">
                <AlertTriangle size={18} color={summaryData.alertsSummary.pendingAlerts > 0 ? "var(--accent-amber)" : "var(--primary)"} />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, letterSpacing: '-0.02em' }}>
                Alerts &amp; Unusual Activity Summary
              </h3>
            </div>
            <span className={`badge ${summaryData.alertsSummary.pendingAlerts > 0 ? 'badge-amber' : 'badge-emerald'}`}>
              {summaryData.alertsSummary.pendingAlerts > 0 ? `${summaryData.alertsSummary.pendingAlerts} Pending Review` : 'All Reviewed'}
            </span>
          </div>

          <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', margin: '0 0 16px 0', lineHeight: 1.5 }}>
            Automated detection of duplicate charges, atypical spending outliers, and billing irregularities.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '16px' }}>
            <div style={{ padding: '12px 14px', background: '#FAFAF7', border: '1px solid var(--border-color)', borderRadius: '10px' }}>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Duplicate Charges</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '2px' }}>
                {summaryData.alertsSummary.duplicateAlerts}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Identical merchant debit &lt; 24h</div>
            </div>

            <div style={{ padding: '12px 14px', background: '#FAFAF7', border: '1px solid var(--border-color)', borderRadius: '10px' }}>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Unusual Outliers</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-amber)', marginTop: '2px' }}>
                {summaryData.alertsSummary.unusualSpikeAlerts}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Outside typical spend range</div>
            </div>

            <div style={{ padding: '12px 14px', background: '#FAFAF7', border: '1px solid var(--border-color)', borderRadius: '10px' }}>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Already Reviewed</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)', marginTop: '2px' }}>
                {summaryData.alertsSummary.reviewedAlerts}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Resolved by user</div>
            </div>

            <div style={{ padding: '12px 14px', background: '#FAFAF7', border: '1px solid var(--border-color)', borderRadius: '10px' }}>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Pending Review</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: summaryData.alertsSummary.pendingAlerts > 0 ? 'var(--accent-amber)' : 'var(--text-main)', marginTop: '2px' }}>
                {summaryData.alertsSummary.pendingAlerts}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Action recommended</div>
            </div>
          </div>

          <button 
            onClick={() => onNavigate('/anomalies')}
            className="btn btn-secondary btn-sm"
            style={{ width: '100%', fontSize: '0.8rem' }}
          >
            <span>Go to Unusual Transactions Page</span>
            <ChevronRight size={14} />
          </button>
        </div>

        {/* TOP 5 LARGEST TRANSACTIONS */}
        <div className="glass-panel" style={{ padding: '24px', background: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div className="icon-box-mint">
                <TrendingUp size={18} color="var(--primary)" />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, letterSpacing: '-0.02em' }}>
                Top 5 Largest Transactions
              </h3>
            </div>
            <button 
              onClick={() => onNavigate('/transactions')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.74rem', padding: '4px 10px' }}
            >
              View All
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {summaryData.topTransactions.map((tx, idx) => (
              <div 
                key={idx}
                style={{
                  background: '#FAFAF7',
                  border: '1px solid var(--border-color)',
                  borderRadius: '10px',
                  padding: '12px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <strong style={{ fontSize: '0.88rem', color: 'var(--text-main)' }}>{tx.cleanMerchant}</strong>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {tx.date} • {tx.category}
                  </div>
                </div>

                <div style={{ fontSize: '0.96rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  {formatINR(tx.amount)}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 5. FINANCIAL INSIGHTS CALLOUT BANNER */}
      {summaryData.insights.length > 0 && (
        <div style={{
          background: 'var(--badge-bg)',
          border: '1px solid #D2DDD0',
          borderRadius: '16px',
          padding: '20px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontWeight: 800, fontSize: '0.92rem' }}>
            <ShieldCheck size={20} />
            <span>Key Financial Summary &amp; Behavioral Insights</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '8px' }}>
            {summaryData.insights.map((insight, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.82rem', color: 'var(--text-main)', lineHeight: 1.45 }}>
                <span style={{ color: 'var(--primary)', fontWeight: 700 }}>•</span>
                <span>{insight}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CONFIRMATION TOAST */}
      {toastMessage && (
        <div 
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            background: '#FFFFFF',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '12px 18px',
            boxShadow: '0 8px 24px rgba(32, 55, 51, 0.14)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            zIndex: 1100,
            fontSize: '0.875rem',
            color: 'var(--text-main)',
            fontWeight: 500,
            animation: 'fadeIn 0.2s ease'
          }}
        >
          <div className="icon-box-mint" style={{ width: '28px', height: '28px', borderRadius: '50%' }}>
            <CheckCircle2 size={16} color="var(--primary)" />
          </div>
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '2px',
              display: 'flex',
              alignItems: 'center',
              marginLeft: '6px'
            }}
          >
            <X size={15} />
          </button>
        </div>
      )}

    </div>
  );
}
