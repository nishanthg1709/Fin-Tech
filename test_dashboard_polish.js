/**
 * Dashboard Polish & Data Transformation Verification Suite
 * Tests all requirements from the prompt:
 * 1. Clean Dashboard Structure
 * 2. Realistic Data Transformation Layer (RAW -> NORMALIZED -> PROCESSED -> VIEWMODEL -> UI)
 * 3. Strict Indian Rupee (₹) Formatting
 * 4. Realistic Middle-Class Balance Logic
 * 5. Grounded Financial Health Score & Explanations
 * 6. Cash Flow Income vs Spending Visualization Data
 * 7. Meaningful Spending Categories
 * 8. Dynamic Upcoming Payments
 * 9. Compact Recent Transactions with Drawer Integration
 * 10. Actionable Personalized Insights
 * 11. Full State Handling (Normal, Empty)
 */

import { readFileSync } from 'fs';
import { generateSampleCSVString, parseCSVStatement } from './src/services/engine/statementParser.js';
import { runFinancialIntelligencePipeline } from './src/services/engine/processor.js';
import { getDashboardViewModel, CATEGORY_META } from './src/services/engine/dashboardViewModel.js';
import { formatINR } from './src/utils/formatters.js';

let passed = 0;
let failed = 0;

function assert(condition, testName, details = '') {
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${testName} - ${details}`);
    failed++;
  }
}

console.log('====================================================');
console.log('🚀 RUNNING DASHBOARD POLISH & VIEW MODEL VERIFICATION');
console.log('====================================================\n');

// 1. Data Transformation Layer Architecture
console.log('1. Dashboard View Model Transformation Layer:');
const sampleCsv = generateSampleCSVString(200);
const rawTransactions = parseCSVStatement(sampleCsv);
const pipelineData = runFinancialIntelligencePipeline(rawTransactions, 78450.0);
const activeSourceInfo = {
  fileName: 'HDFC_200_Transactions.csv',
  validCount: 200,
  dateRange: { label: 'Apr 18, 2025 – Oct 2, 2026' }
};

const vm = getDashboardViewModel(pipelineData, activeSourceInfo, { period: 'THIS_MONTH' });

assert(vm !== null && typeof vm === 'object', 'Generated clean ViewModel object');
assert(vm.isEmpty === false, 'ViewModel correctly identifies non-empty dataset');
assert(vm.currentPeriodLabel === 'Apr 18, 2025 – Oct 2, 2026', 'Inherits active statement date range label');

// 2. Strict INR Formatting & No Dollar Signs
console.log('\n2. Currency & Realistic Balance Logic:');
assert(formatINR(78450).startsWith('₹'), 'formatINR uses Indian Rupee symbol (₹)');
assert(!formatINR(78450).includes('$'), 'Zero dollar signs ($) in formatINR');
assert(formatINR(78450) === '₹78,450', 'Formatted ₹78,450 with Indian grouping');
assert(formatINR(124500) === '₹1,24,500', 'Formatted ₹1,24,500 with Indian grouping');
assert(vm.hero.availableBalance >= 20000, 'Available balance reflects imported statement balance (realistic middle-class)');

// 3. Primary Hero Section Metrics
console.log('\n3. Primary Hero Financial Metrics:');
assert(vm.hero.monthlyIncome > 0, `Derived monthly income (>0, got ₹${vm.hero.monthlyIncome})`);
assert(vm.hero.monthlySpending > 0, `Derived monthly spending (>0, got ₹${vm.hero.monthlySpending})`);
assert(typeof vm.hero.savingsRate === 'number', `Derived savings rate (got ${vm.hero.savingsRate}%)`);
assert(vm.hero.safeToSpendTotal > 0, `Derived safe to spend total (got ₹${vm.hero.safeToSpendTotal})`);
assert(vm.hero.safeToSpendDaily > 0, `Derived daily safe to spend guideline (got ₹${vm.hero.safeToSpendDaily}/day)`);
assert(vm.hero.runwayDays >= 30, `Derived runway days (got ${vm.hero.runwayDays} days)`);
assert(vm.hero.comparison !== null && vm.hero.comparison.text, 'Generated previous period comparison / trend note');

// 4. Grounded Financial Health Score & Explanations
console.log('\n4. Grounded Financial Health Engine:');
assert(vm.health.score >= 50 && vm.health.score <= 100, `Health score between 50 and 100 (got ${vm.health.score})`);
assert(['STRONG', 'GOOD', 'MODERATE', 'ATTENTION NEEDED'].includes(vm.health.status), `Health status is grounded (got "${vm.health.status}")`);
assert(vm.health.factors.spendingControl > 0 || vm.health.factors.spending > 0, 'Includes spending control factor');
assert(vm.health.factors.savings > 0 || vm.health.factors.savingsBehavior > 0, 'Includes savings behavior factor');
assert(vm.health.explanations.length >= 3, `Includes at least 3 factual explanations (got ${vm.health.explanations.length})`);
assert(vm.health.explanations.every(e => !e.text.includes('guaranteed')), 'Excludes exaggerated pseudo-guarantee claims');
assert(vm.health.explanations.some(e => e.text.includes('savings rate') || e.text.includes('pattern')), 'Factual explanation based on transaction patterns');

// 5. Cash Flow Visualization Model
console.log('\n5. Cash Flow Inflows vs Outflows Model:');
assert(vm.cashFlow.currentMonth.income >= 0, 'Current month income tracked');
assert(vm.cashFlow.currentMonth.spending >= 0, 'Current month spending tracked');
assert(typeof vm.cashFlow.currentMonth.net === 'number', 'Net cash flow computed');
assert(Array.isArray(vm.cashFlow.months), 'Multi-month trend array provided');
assert(vm.cashFlow.months.length >= 1, `Populated multi-month progression bars (got ${vm.cashFlow.months.length})`);

// Test different period options:
const vm3Months = getDashboardViewModel(pipelineData, activeSourceInfo, { period: 'LAST_3_MONTHS' });
assert(vm3Months.cashFlow.months.length <= 3, 'Filtered to max 3 months when LAST_3_MONTHS is selected');

// 6. Meaningful Spending Categories
console.log('\n6. Spending Categories Breakdown:');
assert(vm.spending.categories.length >= 4, `Derived top spending categories (got ${vm.spending.categories.length})`);
const topCat = vm.spending.topCategory;
assert(topCat !== null, 'Identified top spending category');
assert(topCat.amount > 0, `Top category has amount (got ₹${topCat.amount})`);
assert(topCat.percentage > 0, `Top category has percentage (got ${topCat.percentage}%)`);
assert(topCat.count >= 1, `Top category tracks transaction count (got ${topCat.count})`);
assert(Boolean(topCat.color), 'Category has distinct brand color');
assert(Boolean(topCat.icon), 'Category has icon identifier');

// 7. Upcoming Recurring Payments
console.log('\n7. Upcoming Payments Derived from Recurrence Engine:');
assert(vm.upcoming.count > 0, `Detected upcoming payments (got ${vm.upcoming.count})`);
assert(vm.upcoming.totalExpected > 0, `Calculated upcoming total expected (got ₹${vm.upcoming.totalExpected})`);
const firstUpcoming = vm.upcoming.items[0];
assert(firstUpcoming.merchantName.length > 0, `Upcoming item has merchant name ("${firstUpcoming.merchantName}")`);
assert(firstUpcoming.amount > 0, `Upcoming item has amount (₹${firstUpcoming.amount})`);
assert(Boolean(firstUpcoming.expectedDate), `Upcoming item has expected date ("${firstUpcoming.expectedDate}")`);
assert(Boolean(firstUpcoming.interval), `Upcoming item has frequency interval ("${firstUpcoming.interval}")`);

// 8. Recent Transactions & Drawer Integration
console.log('\n8. Recent Transactions List & Drawer Object Preservation:');
assert(vm.recentTransactions.length >= 5, `Extracted recent transactions (got ${vm.recentTransactions.length})`);
const recent1 = vm.recentTransactions[0];
assert(Boolean(recent1.id), 'Recent transaction has unique ID');
assert(Boolean(recent1.date), 'Recent transaction has date');
assert(Boolean(recent1.displayMerchant), `Recent transaction has merchant ("${recent1.displayMerchant}")`);
assert(recent1.amount > 0, `Recent transaction has amount (₹${recent1.amount})`);
assert(recent1.isCredit !== undefined, 'Recent transaction indicates Credit vs Debit');

// 9. Personalized Actionable Insights
console.log('\n9. Personalized Financial Insights:');
assert(vm.insights.length >= 3, `Generated at least 3 personalized insights (got ${vm.insights.length})`);
assert(!vm.insights.some(i => i.description.includes('Keep going!')), 'No generic cheerleader copy');
assert(vm.insights.some(i => i.type === 'spending_pattern' || i.type === 'recurring_burden'), 'Derived from actual spending and recurring facts');
assert(vm.insights.every(i => Boolean(i.actionRoute)), 'All insights contain actionable routing');

// 10. Empty State Handling
console.log('\n10. Empty State Support:');
const emptyVm = getDashboardViewModel({ normalizedTransactions: [] }, null);
assert(emptyVm.isEmpty === true, 'Empty ViewModel marked isEmpty: true');
assert(emptyVm.hero.availableBalance === 0, 'Empty balance is 0');
assert(emptyVm.spending.categories.length === 0, 'Empty categories list');
assert(emptyVm.upcoming.items.length === 0, 'Empty upcoming items');

// 11. Dashboard Overview Component Code Structure
console.log('\n11. DashboardOverview UI Component Capabilities:');
const overviewCode = readFileSync('./src/components/DashboardOverview.jsx', 'utf-8');
assert(overviewCode.includes('FinancialHero'), 'Renders FinancialHero');
assert(overviewCode.includes('CashFlowCard'), 'Renders CashFlowCard');
assert(overviewCode.includes('FinancialHealth'), 'Renders FinancialHealth');
assert(overviewCode.includes('SpendingCategoriesCard'), 'Renders SpendingCategoriesCard');
assert(overviewCode.includes('UpcomingPaymentsCard'), 'Renders UpcomingPaymentsCard');
assert(overviewCode.includes('RecentTransactionsCard'), 'Renders RecentTransactionsCard');
assert(overviewCode.includes('InsightCard'), 'Renders InsightCard');
assert(overviewCode.includes('TransactionDrawer'), 'Renders TransactionDrawer');
assert(overviewCode.includes('EmptyState'), 'Renders EmptyState');

// Verify all 5 Command Center links from test_multipage_routes.js are preserved
assert(overviewCode.includes("onNavigate('/subscriptions')"), 'Preserves /subscriptions link');
assert(overviewCode.includes("onNavigate('/cash-flow')"), 'Preserves /cash-flow link');
assert(overviewCode.includes("onNavigate('/spending')"), 'Preserves /spending link');
assert(overviewCode.includes("onNavigate('/unusual-transactions')"), 'Preserves /unusual-transactions link');
assert(overviewCode.includes("onNavigate('/price-changes')"), 'Preserves /price-changes link');

console.log('\n====================================================');
console.log(`TOTAL DASHBOARD TESTS: ${passed + failed}`);
console.log(`PASSED: ${passed}`);
console.log(`FAILED: ${failed}`);
console.log('====================================================');

if (failed > 0) {
  process.exit(1);
} else {
  console.log('🎉 ALL DASHBOARD POLISH & VIEW MODEL TESTS PASSED!\n');
}
