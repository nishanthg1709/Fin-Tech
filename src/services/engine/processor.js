/**
 * Unified Financial Intelligence Pipeline
 * Coordinates normalization, recurrence detection, price change tracking,
 * upcoming billing prediction, anomaly detection, and cash-flow projection.
 */

import { normalizeTransaction } from './normalizer.js';
import { detectRecurringExpenses } from './recurrenceDetector.js';
import { detectPriceChanges } from './priceChangeDetector.js';
import { predictUpcomingPayments } from './upcomingPredictor.js';
import { detectAnomalies } from './anomalyDetector.js';
import { forecastCashFlow } from './cashFlowForecaster.js';

export function runFinancialIntelligencePipeline(rawTransactions = [], currentBalance = 78450.0, userOverrides = {}) {
  const safeTxs = Array.isArray(rawTransactions) ? rawTransactions : [];

  // Check if balance is provided in CSV metadata or transactions
  let effectiveBalance = currentBalance;
  if (safeTxs.metadata?.latestBalance !== undefined && safeTxs.metadata.latestBalance !== null) {
    effectiveBalance = safeTxs.metadata.latestBalance;
  } else {
    const txWithBalance = safeTxs.slice().reverse().find(t => t.balance !== null && t.balance !== undefined && !isNaN(t.balance));
    if (txWithBalance) {
      effectiveBalance = Number(txWithBalance.balance);
    }
  }

  // Step 1: Normalize transactions
  const normalizedTransactions = safeTxs.map(tx => {
    const rawText = tx.rawNarration || tx.description || tx.raw || tx.merchant || '';
    const norm = normalizeTransaction(rawText, tx.category || tx.suggestedCategory);

    const cleanMerchant = (tx.cleanMerchant && tx.cleanMerchant.trim()) || 
                          (tx.merchant && tx.merchant.trim()) || 
                          norm.cleanMerchant;

    const category = (tx.category && tx.category.trim() && tx.category !== 'Other')
      ? tx.category.trim()
      : (norm.category && norm.category !== 'Other' ? norm.category : (tx.category || 'Other'));

    return {
      ...tx,
      ...norm,
      merchant: cleanMerchant,
      cleanMerchant,
      category,
      suggestedCategory: category,
      amount: Number(tx.amount) || 0
    };
  });

  // Step 2: Detect Recurring Payments (1 Month, 3 Months, 6 Months, 1 Year)
  const subscriptions = detectRecurringExpenses(normalizedTransactions, userOverrides);

  // Step 3: Detect Price Changes
  const priceChanges = detectPriceChanges(subscriptions);

  // Step 4: Predict Upcoming Payments
  const upcomingBills = predictUpcomingPayments(subscriptions);

  // Step 5: Detect Unusual Transactions
  const anomalies = detectAnomalies(normalizedTransactions, subscriptions);

  // Step 6: Forecast Cash-Flow commitments
  const cashFlow = forecastCashFlow(subscriptions, effectiveBalance, '30 Days');

  // Compute Aggregates in INR (supporting canonical "income"/"expense" and legacy "CREDIT"/"DEBIT")
  const isCredit = (t) => t.type === 'CREDIT' || t.type === 'income' || t.canonical_type === 'income';
  const isDebit = (t) => (t.type === 'DEBIT' || t.type === 'expense' || t.canonical_type === 'expense' || (t.type !== 'CREDIT' && t.type !== 'income' && t.type !== 'transfer')) && t.type !== 'transfer';

  const debits = normalizedTransactions.filter(t => isDebit(t) && t.amount > 0);
  const credits = normalizedTransactions.filter(t => isCredit(t) && t.amount > 0);

  const totalSpending = debits.reduce((sum, t) => sum + t.amount, 0);
  const totalIncome = credits.reduce((sum, t) => sum + t.amount, 0);
  const netCashFlow = totalIncome - totalSpending;
  const transactionCount = normalizedTransactions.length;

  // Monthly recurring equivalent:
  const monthlyRecurring = subscriptions.reduce((sum, s) => {
    if (!s.isActive) return sum;
    if (s.normalizedMonthly) return sum + s.normalizedMonthly;
    if (s.interval === '1 Month') return sum + s.currentPrice;
    if (s.interval === '3 Months') return sum + Math.round(s.currentPrice / 3);
    if (s.interval === '6 Months') return sum + Math.round(s.currentPrice / 6);
    if (s.interval === '1 Year') return sum + Math.round(s.currentPrice / 12);
    return sum + s.currentPrice;
  }, 0);

  const annualCommitment = subscriptions.reduce((sum, s) => {
    return s.isActive ? sum + s.annualCost : sum;
  }, 0);

  // Category spending breakdown across debits
  const categorySpending = {};
  for (const t of debits) {
    const cat = t.category || 'Other';
    categorySpending[cat] = (categorySpending[cat] || 0) + t.amount;
  }

  // Top merchants by spending
  const merchantSpending = {};
  for (const t of debits) {
    const m = t.cleanMerchant || t.merchant || 'Unknown';
    merchantSpending[m] = (merchantSpending[m] || 0) + t.amount;
  }
  const topMerchants = Object.entries(merchantSpending)
    .map(([merchant, amount]) => ({ merchant, amount }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  // Payment method breakdown
  const paymentMethodBreakdown = {};
  for (const t of debits) {
    const mode = t.payment_mode || t.paymentMode || 'Electronic';
    paymentMethodBreakdown[mode] = (paymentMethodBreakdown[mode] || 0) + t.amount;
  }

  // Category breakdown for subscriptions
  const categoryBreakdown = {};
  for (const sub of subscriptions) {
    if (!sub.isActive) continue;
    categoryBreakdown[sub.category] = (categoryBreakdown[sub.category] || 0) + sub.currentPrice;
  }

  // Recurring classifications summary breakdown
  const actualSubscriptions = subscriptions.filter(s => s.classification === 'SUBSCRIPTION');
  const billsRecurring = subscriptions.filter(s => s.classification === 'BILL');
  const commitmentsRecurring = subscriptions.filter(s => s.classification === 'COMMITMENT');
  const otherRecurring = subscriptions.filter(s => s.classification === 'OTHER');

  const monthlySubscriptionsCost = actualSubscriptions.reduce((sum, s) => sum + (s.normalizedMonthly || s.currentPrice), 0);

  return {
    rawCount: safeTxs.length,
    normalizedTransactions,
    subscriptions,
    recurringPayments: subscriptions,
    unconfirmedRepeated: subscriptions.unconfirmedRepeated || [],
    singlePaymentMerchants: subscriptions.singlePaymentMerchants || [],
    priceChanges,
    upcomingBills,
    anomalies,
    cashFlow,
    summary: {
      totalSpending,
      totalIncome,
      netCashFlow,
      transactionCount,
      totalSubscriptionsCount: subscriptions.length,
      activeSubscriptionsCount: subscriptions.filter(s => s.isActive).length,
      actualSubscriptionsCount: actualSubscriptions.length,
      monthlySubscriptionsCost,
      billsCount: billsRecurring.length,
      commitmentsCount: commitmentsRecurring.length,
      otherRecurringCount: otherRecurring.length,
      monthlyRecurring,
      annualCommitment,
      priceChangesCount: priceChanges.length,
      anomaliesCount: anomalies.length,
      safeToSpend: cashFlow.safeToSpend,
      currentBalance: effectiveBalance,
      categorySpending,
      categoryBreakdown,
      topMerchants,
      paymentMethodBreakdown
    }
  };
}
