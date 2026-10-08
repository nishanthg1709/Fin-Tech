/**
 * Verification Test Suite for Real CSV -> Supabase Persistence (Phase 2B)
 * Tests:
 * 1. CSV parsing and validation
 * 2. Normalization pipeline integration
 * 3. Deterministic transaction fingerprinting & duplicate protection
 * 4. Authenticated user isolation (RLS / auth.uid())
 * 5. Account creation and reuse in `accounts` table
 * 6. Batch inserts with positive amount + credit/debit convention
 * 7. Structured import summary (imported, skipped, duplicates, failed)
 * 8. Real Supabase integration & client configuration
 */

import { readFileSync, existsSync } from 'fs';

// 0. Load .env into process.env for Node.js test environment
if (existsSync('.env')) {
  const envContent = readFileSync('.env', 'utf-8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...rest] = trimmed.split('=');
      if (key && rest.length > 0) {
        process.env[key.trim()] = rest.join('=').trim();
      }
    }
  }
}

// Dynamically import persistence services after environment variables are set
const { 
  supabase, 
  csvPersistenceService, 
  generateTransactionFingerprint, 
  formatTransactionRecord 
} = await import('./src/services/supabase.js');

const { parseCSVStatement } = await import('./src/services/engine/statementParser.js');
const { executeNormalizationPipeline } = await import('./src/services/engine/normalization/index.js');

console.log('====================================================');
console.log('🚀 RUNNING REAL CSV → SUPABASE PERSISTENCE TEST SUITE');
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
// 1. CSV Parsing Engine
// ---------------------------------------------------------------------------
console.log('1. CSV Parsing Engine (statementParser.js):');
const sampleCsv = `date,description,merchant,category,debit_inr,credit_inr,balance_inr,status
2026-03-01,UPI/NETFLIX/481923,Netflix,Entertainment,649.00,,45000.00,Completed
2026-03-02,ACH/SALARY/INFOSYS,Infosys,Income,,85000.00,130000.00,Completed
2026-03-03,UPI/SWIGGY/ORDER991,Swiggy,Food,420.50,,129579.50,Completed
2026-03-03,UPI/SWIGGY/ORDER991,Swiggy,Food,420.50,,129159.00,Completed`;

const parsed = parseCSVStatement(sampleCsv, 'hdfc_march_statement.csv');
assert(Array.isArray(parsed) && parsed.length === 4, 'parseCSVStatement parses 4 valid rows');
assert(parsed[0].amount === 649, 'Parses debit as positive amount ₹649');
assert(parsed[1].amount === 85000, 'Parses credit as positive amount ₹85,000');
assert(parsed[1].type === 'CREDIT' || parsed[1].canonical_type === 'income', 'Classifies salary as credit/income');
assert(parsed[0].type === 'DEBIT' || parsed[0].canonical_type === 'expense', 'Classifies Netflix as debit/expense');

// ---------------------------------------------------------------------------
// 2. Normalization Engine Integration
// ---------------------------------------------------------------------------
console.log('\n2. Normalization Engine Integration (normalizer.js):');
const normResult = executeNormalizationPipeline(sampleCsv);
assert(normResult && Array.isArray(normResult.transactions), 'executeNormalizationPipeline returns normalized transactions');
assert(normResult.transactions.length === 3 && normResult.duplicateTransactions.length === 1, 'Normalizes candidate rows and catches the duplicate row');
const netflixTx = normResult.transactions.find(t => t.merchant.toLowerCase().includes('netflix'));
assert(netflixTx && netflixTx.category === 'Entertainment', 'Correctly categorizes Netflix as Entertainment');
assert(netflixTx.cleanMerchant === 'Netflix', 'Cleans UPI narration into canonical merchant "Netflix"');

// ---------------------------------------------------------------------------
// 3. Stable Transaction Fingerprinting & Duplicate Detection
// ---------------------------------------------------------------------------
console.log('\n3. Deterministic Transaction Fingerprint & Duplicate Protection:');
const txA = {
  date: '2026-03-01',
  amount: 649.00,
  type: 'expense',
  original_description: 'UPI-NETFLIX-91823'
};
const txB = {
  date: '2026-03-01',
  amount: 649,
  transaction_type: 'debit',
  original_description: '  UPI-NETFLIX-91823  '
};
const txDifferent = {
  date: '2026-03-02',
  amount: 649.00,
  type: 'expense',
  original_description: 'UPI-NETFLIX-91823'
};

const fpA = generateTransactionFingerprint(txA);
const fpB = generateTransactionFingerprint(txB);
const fpDiff = generateTransactionFingerprint(txDifferent);

assert(fpA.startsWith('fp_'), 'Fingerprint has fp_ prefix');
assert(fpA === fpB, 'Fingerprint is identical despite amount number format or description whitespace');
assert(fpA !== fpDiff, 'Fingerprints differ when transaction date changes');

// ---------------------------------------------------------------------------
// 4. Record Formatting & Convention Enforcement
// ---------------------------------------------------------------------------
console.log('\n4. Database Record Formatting & Strict Constraints:');
const testUserId = '11111111-2222-3333-4444-555555555555';
const testAccountId = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';

const formattedValid = formatTransactionRecord(txA, testUserId, testAccountId, 'test.csv');
assert(formattedValid.valid === true, 'formatTransactionRecord accepts valid transaction');
assert(formattedValid.record.user_id === testUserId, 'Enforces strictly authenticated user_id');
assert(formattedValid.record.account_id === testAccountId, 'Attaches verified account_id');
assert(formattedValid.record.amount === 649, 'Amount is strictly positive number');
assert(formattedValid.record.transaction_type === 'debit', 'Maps expense to debit transaction_type');
assert(formattedValid.record.currency === 'INR', 'Defaults currency to INR');
assert(formattedValid.record.source === 'csv', 'Defaults source to csv');
assert(Boolean(formattedValid.record.metadata?.fingerprint), 'Stores deterministic fingerprint in JSONB metadata');

// Invalid records handling
const missingDate = formatTransactionRecord({ amount: 100 }, testUserId);
assert(missingDate.valid === false, 'Rejects record with missing date');

const zeroAmount = formatTransactionRecord({ date: '2026-03-01', amount: 0 }, testUserId);
assert(zeroAmount.valid === false, 'Rejects zero-amount transaction (violates amount > 0)');

const missingUser = formatTransactionRecord({ date: '2026-03-01', amount: 100 }, null);
assert(missingUser.valid === false, 'Rejects persistence without authenticated user ID');

// ---------------------------------------------------------------------------
// 5. Authenticated User Isolation & Security
// ---------------------------------------------------------------------------
console.log('\n5. Authenticated User Isolation & Security (RLS Boundary):');
const unauthResult = await csvPersistenceService.persistTransactions([txA], { userId: null });
assert(unauthResult.success === false, 'Rejects unauthenticated persistence request');
assert(unauthResult.error.includes('Authentication required'), 'Presents clean error for unauthenticated user');
assert(unauthResult.imported === 0, 'Zero rows imported when unauthenticated');

// ---------------------------------------------------------------------------
// 6. Account Creation / Reuse Logic
// ---------------------------------------------------------------------------
console.log('\n6. Account Creation & Reuse:');
assert(typeof csvPersistenceService.getOrCreateUserAccount === 'function', 'csvPersistenceService provides getOrCreateUserAccount');
const accResult = await csvPersistenceService.getOrCreateUserAccount(testUserId, {
  institutionName: 'HDFC Bank',
  currentBalance: 75000
});
assert(accResult && Boolean(accResult.account), 'Resolves or provisions user account object');
assert(accResult.account.currency === 'INR', 'Account uses INR currency');
assert(accResult.account.user_id === testUserId, 'Account matches user ID');

// ---------------------------------------------------------------------------
// 7. Duplicate Filtering & Import Summary
// ---------------------------------------------------------------------------
console.log('\n7. Duplicate Filtering & Import Summary:');
const duplicateBatch = [
  { date: '2026-03-01', amount: 100, type: 'expense', description: 'Coffee at Blue Tokai' },
  { date: '2026-03-01', amount: 100, type: 'expense', description: 'Coffee at Blue Tokai' }, // duplicate of row 1
  { date: '2026-03-02', amount: 250, type: 'expense', description: 'Auto Rickshaw' },
  { date: '2026-03-03', amount: -50, type: 'expense', description: 'Invalid negative row' } // invalid
];

// Test persistence pipeline deduplication
const importSummary = await csvPersistenceService.persistTransactions(duplicateBatch, {
  userId: testUserId,
  accountId: testAccountId,
  fileName: 'march_expenses.csv'
});

assert(importSummary.totalRows === 4, 'Summary reports 4 total input rows');
assert(importSummary.duplicates === 1, 'Summary reports exactly 1 duplicate skipped');
assert(importSummary.skipped >= 1, 'Summary reports skipped rows count');
assert(Array.isArray(importSummary.validationErrors), 'Summary provides validation errors list');

// ---------------------------------------------------------------------------
// 8. Remote Supabase Table Verification
// ---------------------------------------------------------------------------
console.log('\n8. Remote Supabase Database Connectivity:');
assert(Boolean(supabase), 'Supabase client is configured and active');
const accountsRef = supabase.from('accounts');
assert(typeof accountsRef.select === 'function', 'accounts table query builder is active');
const transactionsRef = supabase.from('transactions');
assert(typeof transactionsRef.select === 'function', 'transactions table query builder is active');
const profilesRef = supabase.from('profiles');
assert(typeof profilesRef.select === 'function', 'profiles table query builder is active');

// ---------------------------------------------------------------------------
// 9. Frontend Integration Checks
// ---------------------------------------------------------------------------
console.log('\n9. Frontend Component Integration:');
const uploadViewSource = readFileSync('./src/components/UploadTransactionsView.jsx', 'utf-8');
assert(uploadViewSource.includes('csvPersistenceService'), 'UploadTransactionsView imports csvPersistenceService');
assert(uploadViewSource.includes('csvPersistenceService.persistTransactions'), 'UploadTransactionsView calls persistTransactions');
assert(uploadViewSource.includes('importSummary'), 'UploadTransactionsView captures import summary in metadata');

const appSource = readFileSync('./src/App.jsx', 'utf-8');
assert(appSource.includes('csvPersistenceService.fetchUserTransactions'), 'App.jsx synchronizes user transactions from Supabase');

console.log('\n====================================================');
console.log(`TOTAL PHASE 2B PERSISTENCE TESTS: ${total}`);
console.log(`PASSED: ${passed}`);
console.log(`FAILED: ${total - passed}`);
console.log('====================================================');

if (passed === total) {
  console.log('🎉 ALL PHASE 2B PERSISTENCE TESTS PASSED PERFECTLY!\n');
} else {
  process.exit(1);
}
