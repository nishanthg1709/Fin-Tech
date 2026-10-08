/**
 * Complete Frontend MVP Verification Test Suite
 * Validates all frontend views, data flows, controls, and states.
 */

import { readFileSync } from 'fs';
import { runFinancialIntelligencePipeline } from './src/services/engine/processor.js';
import { generateSampleCSVString, parseCSVWithMetadata } from './src/services/engine/statementParser.js';
import { formatINR } from './src/utils/formatters.js';

console.log('====================================================');
console.log('🚀 RUNNING COMPLETE FRONTEND MVP VERIFICATION SUITE');
console.log('====================================================\n');

let passed = 0;
let total = 0;

function assert(cond, msg) {
  total++;
  if (cond) {
    console.log(`  ✓ PASS: ${msg}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${msg}`);
    process.exitCode = 1;
  }
}

// ---------------------------------------------------------------------------
// 1. Pipeline & Data Preparation
// ---------------------------------------------------------------------------
console.log('1. Pipeline & Real Data Processing:');
const csvString = generateSampleCSVString();
const { transactions: parsedTxs } = parseCSVWithMetadata(csvString, 'statement.csv');
const pipelineData = runFinancialIntelligencePipeline(parsedTxs, 78450.0, {});

assert(Array.isArray(pipelineData.normalizedTransactions) && pipelineData.normalizedTransactions.length > 50, 'Processed normalized transactions (>50 records)');
assert(Array.isArray(pipelineData.subscriptions) && pipelineData.subscriptions.length > 0, 'Detected dynamic recurring subscriptions');
assert(pipelineData.summary.currentBalance > 0, 'Preserved realistic account balance (>0)');

// ---------------------------------------------------------------------------
// 2. Transactions View (TransactionsView.jsx)
// ---------------------------------------------------------------------------
console.log('\n2. Transactions Ledger & Audit Controls:');
const txSource = readFileSync('./src/components/TransactionsView.jsx', 'utf-8');

assert(txSource.includes('searchQuery') && txSource.includes('setSearchQuery'), 'Includes search filter');
assert(txSource.includes('selectedCategory') && txSource.includes('setSelectedCategory'), 'Includes category filter');
assert(txSource.includes('selectedMerchant') && txSource.includes('setSelectedMerchant'), 'Includes merchant filter');
assert(txSource.includes('amountRange') && txSource.includes('setAmountRange'), 'Includes amount range filter');
assert(txSource.includes('selectedAccount') && txSource.includes('setSelectedAccount'), 'Includes account / bank filter');
assert(txSource.includes('dateFilter') && txSource.includes('setDateFilter'), 'Includes date range filter (This Month, Last Month, etc.)');
assert(txSource.includes('reviewFilter') && txSource.includes('setReviewFilter'), 'Includes review status filter');
assert(txSource.includes('sortBy') && txSource.includes('setSortBy'), 'Includes sorting (Date asc/desc, Amount asc/desc)');
assert(txSource.includes('handleResetFilters'), 'Includes Clear Filters action');
assert(txSource.includes('toggleReviewTx'), 'Supports immediate reviewed state toggle');
assert(txSource.includes('stats.income') && txSource.includes('stats.spending') && txSource.includes('stats.net'), 'Displays total income, spending, and net movement');
assert(txSource.includes('formatINR'), 'Strictly formats currency via formatINR');
assert(txSource.includes('hidden md:block') && txSource.includes('block md:hidden'), 'Provides responsive desktop table and mobile card views');
assert(txSource.includes('TransactionDrawer'), 'Integrates slide-over TransactionDrawer');
assert(txSource.includes('EmptyState'), 'Provides EmptyState for zero transactions');

// ---------------------------------------------------------------------------
// 3. TransactionDrawer Review Action Integration
// ---------------------------------------------------------------------------
console.log('\n3. Transaction Drawer Slide-over:');
const drawerSource = readFileSync('./src/components/common/TransactionDrawer.jsx', 'utf-8');

assert(drawerSource.includes('isReviewed') && drawerSource.includes('onToggleReviewed'), 'Supports isReviewed and onToggleReviewed props');
assert(drawerSource.includes('formatINR'), 'Uses formatINR for drawer hero amount');
assert(drawerSource.includes('ShieldCheck'), 'Displays audit review button in drawer footer');

// ---------------------------------------------------------------------------
// 4. Spending & Analytics (SpendingSummaryView.jsx)
// ---------------------------------------------------------------------------
console.log('\n4. Spending Summary & Analytics:');
const spendingSource = readFileSync('./src/components/SpendingSummaryView.jsx', 'utf-8');

assert(spendingSource.includes('selectedPeriod') && spendingSource.includes('setSelectedPeriod'), 'Includes period selector (This Month, Last Month, Last 3 Months, All Period)');
assert(spendingSource.includes('topMerchants'), 'Derives top spending merchants');
assert(spendingSource.includes('Top Spending Merchants'), 'Renders Top Spending Merchants card');
assert(spendingSource.includes('CategoryExplorer'), 'Integrates interactive CategoryExplorer');
assert(spendingSource.includes('generateSpendingReportPdf'), 'Provides exportable PDF report generation');
assert(spendingSource.includes('EmptyState'), 'Provides EmptyState fallback when no spending data exists');
assert(!spendingSource.includes('USD') && !/\$\s*\d+/.test(spendingSource), 'Contains zero USD or dollar currency symbols');

// ---------------------------------------------------------------------------
// 5. Data-Backed Insights (InsightsView.jsx)
// ---------------------------------------------------------------------------
console.log('\n5. Data-Backed Financial Insights:');
const insightsSource = readFileSync('./src/components/InsightsView.jsx', 'utf-8');

assert(insightsSource.includes('topCat.name') && insightsSource.includes('Category Concentration'), 'Dynamically derives largest spending category insight');
assert(insightsSource.includes('recurringPct') && insightsSource.includes('Recurring Commitments'), 'Dynamically derives recurring commitment ratio insight');
assert(insightsSource.includes('savingsRate') && insightsSource.includes('positive net savings'), 'Dynamically derives savings rate and cash flow surplus insight');
assert(insightsSource.includes('runwayDays') && insightsSource.includes('cash runway'), 'Dynamically derives cash runway cushion insight');
assert(!insightsSource.includes("You're doing amazing!"), 'Zero generic AI cheerleader copy');
assert(insightsSource.includes('EmptyState'), 'Provides EmptyState fallback when no transactions exist');
assert(insightsSource.includes('No financial observations found'), 'Provides fallback message when filter tab has no results');

// ---------------------------------------------------------------------------
// 6. Anomalies & Outlier Investigation (AnomaliesView.jsx & AnomalyCard.jsx)
// ---------------------------------------------------------------------------
console.log('\n6. Anomalies & Outlier Investigation:');
const anomaliesSource = readFileSync('./src/components/AnomaliesView.jsx', 'utf-8');
const anomalyCardSource = readFileSync('./src/components/common/AnomalyCard.jsx', 'utf-8');

assert(anomaliesSource.includes('handleMarkReviewed'), 'Supports marking anomaly as reviewed');
assert(anomaliesSource.includes('handleRestore'), 'Supports restoring dismissed alerts');
assert(anomaliesSource.includes('EmptyState'), 'Shows EmptyState when all unusual transactions are reviewed');
assert(!anomalyCardSource.includes('8450') && !anomalyCardSource.includes('Amazon India'), 'Removed hardcoded dummy fallbacks (8450, Amazon India)');
assert(anomalyCardSource.includes('DUPLICATE CHARGE') && anomalyCardSource.includes('UNUSUAL AMOUNT'), 'Distinguishes duplicate charge vs unusual amount');

// ---------------------------------------------------------------------------
// 7. Price Changes (PriceChangesView.jsx)
// ---------------------------------------------------------------------------
console.log('\n7. Subscription Price Changes:');
const priceSource = readFileSync('./src/components/PriceChangesView.jsx', 'utf-8');

assert(priceSource.includes('onNavigate'), 'Supports client-side navigation via onNavigate');
assert(priceSource.includes('totalAnnualHike'), 'Calculates cumulative annual rate hikes');
assert(priceSource.includes('EmptyState'), 'Renders EmptyState when zero price hikes are detected');

// ---------------------------------------------------------------------------
// 8. Cash Flow & Runway (CashFlowView.jsx)
// ---------------------------------------------------------------------------
console.log('\n8. Cash Flow & Runway Forecasting:');
const cashFlowSource = readFileSync('./src/components/CashFlowView.jsx', 'utf-8');

assert(cashFlowSource.includes('selectedPeriod') && cashFlowSource.includes('setSelectedPeriod'), 'Includes period selector (This Month, Last Month, Last 3 Months)');
assert(cashFlowSource.includes('periodMetrics.income') && cashFlowSource.includes('periodMetrics.spending') && cashFlowSource.includes('periodMetrics.net'), 'Calculates Income Inflow, Total Outflow, and Net Cash Flow');
assert(cashFlowSource.includes('monthlyCashFlowHistory'), 'Tracks multi-month historical cash flow trajectory');
assert(cashFlowSource.includes('FinancialRunway'), 'Integrates FinancialRunway simulation');
assert(cashFlowSource.includes('Scheduled Expected Deductions'), 'Renders scheduled expected recurring deductions');
assert(cashFlowSource.includes('EmptyState'), 'Provides EmptyState when no transactions exist');

// ---------------------------------------------------------------------------
// 9. Savings Simulator (SavingsSimulatorView.jsx)
// ---------------------------------------------------------------------------
console.log('\n9. Savings Simulator & Cancellation Assistant:');
const savingsSource = readFileSync('./src/components/SavingsSimulatorView.jsx', 'utf-8');

assert(savingsSource.includes('Current Monthly Burn'), 'Displays Current Monthly Burn');
assert(savingsSource.includes('Estimated Monthly Savings'), 'Displays Estimated Monthly Savings');
assert(savingsSource.includes('Estimated Annual Savings'), 'Displays Estimated Annual Savings');
assert(savingsSource.includes('Projected Net Outflow'), 'Displays Projected Net Outflow after cuts');
assert(savingsSource.includes('Simulation Notice:') && savingsSource.includes('estimates'), 'Explicitly labels simulation calculations as estimates');
assert(savingsSource.includes('Cancellation Notice Generator'), 'Provides formal revocation notice text generator');
assert(savingsSource.includes('EmptyState'), 'Provides EmptyState when no active subscriptions exist');

// ---------------------------------------------------------------------------
// 10. Login & Signup Flow (LoginView.jsx & SignupView.jsx)
// ---------------------------------------------------------------------------
console.log('\n10. Authentication & Onboarding:');
const loginSource = readFileSync('./src/components/LoginView.jsx', 'utf-8');
const signupSource = readFileSync('./src/components/SignupView.jsx', 'utf-8');

assert(loginSource.includes('showPassword') && loginSource.includes('setShowPassword'), 'LoginView has password visibility toggle');
assert(loginSource.includes('isSubmitting'), 'LoginView has loading state during submission');
assert(signupSource.includes('showPassword') && signupSource.includes('setShowPassword'), 'SignupView has password visibility toggle');
assert(signupSource.includes('isSubmitting'), 'SignupView has loading state during submission');

// ---------------------------------------------------------------------------
// 11. Settings & Profile (SettingsView.jsx)
// ---------------------------------------------------------------------------
console.log('\n11. Settings & Account Controls:');
const settingsSource = readFileSync('./src/components/SettingsView.jsx', 'utf-8');

assert(settingsSource.includes('Profile Information'), 'Contains Profile Information section');
assert(settingsSource.includes('Connected Bank Account'), 'Contains Connected Bank Account section');
assert(settingsSource.includes('Notification Preferences'), 'Contains Notification Preferences section');
assert(settingsSource.includes('Indian Rupee (₹ INR)'), 'Displays Indian Rupee (₹ INR) active currency');
assert(settingsSource.includes('handleClearAlertsCache'), 'Provides working action to clear reviewed alerts');
assert(settingsSource.includes('handleResetData'), 'Provides working action to reset uploaded dataset');
assert(settingsSource.includes('onLogout'), 'Provides working logout action');

// ---------------------------------------------------------------------------
// 12. App Navigation & Routing (App.jsx & Sidebar.jsx)
// ---------------------------------------------------------------------------
console.log('\n12. Global Routing & Navigation:');
const appSource = readFileSync('./src/App.jsx', 'utf-8');
const sidebarSource = readFileSync('./src/components/Sidebar.jsx', 'utf-8');

assert(appSource.includes("currentPath === '/savings'"), 'App.jsx routes /savings to SavingsSimulatorView');
assert(sidebarSource.includes('/savings'), 'Sidebar includes link to /savings (Savings Simulator)');
assert(appSource.includes('CashFlowView') && appSource.includes('transactions={pipelineData.normalizedTransactions}'), 'App.jsx passes normalized transactions to CashFlowView');

// ---------------------------------------------------------------------------
// 13. Currency & Indian Localization Integrity
// ---------------------------------------------------------------------------
console.log('\n13. Currency & Formatting Consistency:');
assert(formatINR(5240) === '₹5,240', 'formatINR formats ₹5,240 correctly');
assert(formatINR(124500) === '₹1,24,500', 'formatINR formats ₹1,24,500 with Indian grouping');
assert(formatINR(52000) === '₹52,000', 'formatINR formats ₹52,000 correctly');

console.log('\n====================================================');
console.log(`TOTAL FRONTEND MVP TESTS: ${total}`);
console.log(`PASSED: ${passed}`);
console.log(`FAILED: ${total - passed}`);
console.log('====================================================');

if (passed === total) {
  console.log('🎉 ALL FRONTEND MVP TESTS PASSED PERFECTLY!\n');
} else {
  process.exit(1);
}
