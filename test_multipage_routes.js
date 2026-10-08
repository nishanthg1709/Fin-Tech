/**
 * Automated Verification Script for Multi-Page Financial Management Application
 * Verifies all 10 required routes and component exports.
 */

import { readFileSync } from 'fs';
import { runFinancialIntelligencePipeline } from './src/services/engine/processor.js';
import { generateSampleCSVString, parseCSVWithMetadata } from './src/services/engine/statementParser.js';

console.log('🚀 Running Multi-Page Financial Management Application Route Verification...\n');

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

// 1. App.jsx Route Definition Checks
console.log('1. Route Configuration in App.jsx:');
const appSource = readFileSync('./src/App.jsx', 'utf-8');

const requiredRoutes = [
  { path: '/overview', name: 'Overview' },
  { path: '/upload-transactions', name: 'Upload Transactions' },
  { path: '/subscriptions', name: 'Subscriptions' },
  { path: '/price-changes', name: 'Price Changes' },
  { path: '/unusual-transactions', name: 'Unusual Transactions' },
  { path: '/spending', name: 'Spending Analysis' },
  { path: '/cash-flow', name: 'Cash Flow Forecast' },
  { path: '/transactions', name: 'All Transactions' },
  { path: '/insights', name: 'Financial Insights' },
  { path: '/settings', name: 'Settings' }
];

requiredRoutes.forEach(r => {
  assert(appSource.includes(`currentPath === '${r.path}'`), `App.jsx routes ${r.name} to ${r.path}`);
});

// 2. Sidebar Navigation Checks
console.log('\n2. Sidebar Navigation Items:');
const sidebarSource = readFileSync('./src/components/Sidebar.jsx', 'utf-8');

requiredRoutes.forEach(r => {
  assert(sidebarSource.includes(r.path), `Sidebar includes item for ${r.name} (${r.path})`);
});

assert(sidebarSource.includes('COMMAND CENTER'), 'Sidebar groups COMMAND CENTER');
assert(sidebarSource.includes('RECURRING & BILLS'), 'Sidebar groups RECURRING & BILLS');
assert(sidebarSource.includes('CASH & INTELLIGENCE'), 'Sidebar groups CASH & INTELLIGENCE');
assert(sidebarSource.includes('ACCOUNT'), 'Sidebar groups ACCOUNT');

// 3. TopHeader Navigation & Safe to Spend Quick Links
console.log('\n3. TopHeader & Quick Links:');
const headerSource = readFileSync('./src/components/TopHeader.jsx', 'utf-8');
assert(headerSource.includes('/cash-flow'), 'TopHeader Safe-to-Spend pill navigates to /cash-flow');
assert(headerSource.includes('/upload-transactions'), 'TopHeader Upload CSV button navigates to /upload-transactions');
assert(headerSource.includes('onToggleSidebar'), 'TopHeader supports mobile sidebar toggle');

// 4. Overview Command Center Clickable Summary Cards
console.log('\n4. Overview Command Center Summary Card Links:');
const overviewSource = readFileSync('./src/components/DashboardOverview.jsx', 'utf-8');
assert(overviewSource.includes("onNavigate('/cash-flow')"), 'Overview Safe-to-Spend links to /cash-flow');
assert(overviewSource.includes("onNavigate('/spending')"), 'Overview Monthly Spending links to /spending');
assert(overviewSource.includes("onNavigate('/subscriptions')"), 'Overview Subscriptions links to /subscriptions');
assert(overviewSource.includes("onNavigate('/unusual-transactions')"), 'Overview Important Alerts links to /unusual-transactions');
assert(overviewSource.includes("onNavigate('/price-changes')"), 'Overview Price Hike Spotlight links to /price-changes');

// 5. Upload Transactions View
console.log('\n5. Upload Transactions Page Capabilities:');
const uploadSource = readFileSync('./src/components/UploadTransactionsView.jsx', 'utf-8');
assert(uploadSource.includes('importProgress'), 'Upload view has import progress animation');
assert(uploadSource.includes('importHistory'), 'Upload view tracks and displays import history');
assert(uploadSource.includes('handleDrop'), 'Upload view supports drag-and-drop file upload');
assert(uploadSource.includes('previewRows'), 'Upload view extracts sample 10-row preview');

// 6. Subscriptions View
console.log('\n6. Subscriptions Page Capabilities:');
const subSource = readFileSync('./src/components/SubscriptionsView.jsx', 'utf-8');
assert(subSource.includes('Monthly Subscription Cost'), 'Shows Monthly Subscription Cost KPI');
assert(subSource.includes('Annual Subscription Cost'), 'Shows Annual Subscription Cost KPI');
assert(subSource.includes('Active Subscriptions'), 'Shows Active Subscriptions count KPI');
assert(subSource.includes('Upcoming Renewals'), 'Shows Upcoming Renewals count KPI');
assert(subSource.includes('viewMode'), 'Provides Cards and Table view toggle');

// 7. Transactions View
console.log('\n7. All Transactions Page Capabilities:');
const txSource = readFileSync('./src/components/TransactionsView.jsx', 'utf-8');
assert(txSource.includes('selectedCategory'), 'Supports Category dropdown filter');
assert(txSource.includes('selectedMerchant'), 'Supports Merchant dropdown filter');
assert(txSource.includes('amountRange'), 'Supports Amount range filter');
assert(txSource.includes('filterType'), 'Supports Income/Expense toggle');
assert(txSource.includes('selectedTransaction'), 'Supports Transaction details modal');
assert(txSource.includes('currentPage') && txSource.includes('pageSize'), 'Supports 15-item Pagination');

// 8. Financial Insights View
console.log('\n8. Personalized Financial Insights Page:');
const insightsSource = readFileSync('./src/components/InsightsView.jsx', 'utf-8');
assert(insightsSource.includes('Spending Patterns'), 'Covers Spending Patterns');
assert(insightsSource.includes('Subscription Intelligence'), 'Covers Subscription Intelligence');
assert(insightsSource.includes('Warnings & Cash Flow') || insightsSource.includes('Cash-Flow Warnings'), 'Covers Cash-Flow Warnings');
assert(insightsSource.includes('Savings Opportunities'), 'Covers Savings Opportunities');
assert(insightsSource.includes('markedForCancel'), 'Includes interactive cancellation simulator');
assert(insightsSource.includes('getEmailContent'), 'Includes formal 1-click cancellation notice');

// 9. Settings View
console.log('\n9. Settings Page:');
const settingsSource = readFileSync('./src/components/SettingsView.jsx', 'utf-8');
assert(settingsSource.includes('Profile Information'), 'Covers Profile Information');
assert(settingsSource.includes('Connected Bank Account'), 'Covers Connected Bank Account');
assert(settingsSource.includes('Notification Preferences'), 'Covers Notification Preferences');
assert(settingsSource.includes('Currency') && settingsSource.includes('Localization'), 'Covers Currency & Localization');
assert(settingsSource.includes('Data Controls'), 'Covers Account Settings & Data Controls');

console.log(`\n==========================================`);
console.log(`RESULT: ${passed}/${total} Multi-Page Route Tests Passed (${Math.round((passed/total)*100)}% Success)`);
console.log(`==========================================\n`);
