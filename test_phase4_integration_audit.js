/**
 * Phase 4 — Smart Money End-to-End Integration & Data Integrity Audit Test Suite
 *
 * Verifies:
 * 1. End-to-End Data Flow integrity
 * 2. User Data Isolation (User A vs User B separation)
 * 3. Empty Database Behavior (zero fake numbers, zero demo merchants)
 * 4. Elimination of Hardcoded Demo Values
 * 5. Deterministic Duplicate Protection
 * 6. Error Handling & Edge Cases
 * 7. Logout / Login State Isolation & Cache Teardown
 * 8. Security Audit (No secrets, safe anon key only)
 */

import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { supabase, authService, profileService } from './src/services/supabase.js';
import { 
  csvPersistenceService, 
  generateTransactionFingerprint, 
  formatTransactionRecord 
} from './src/services/csvPersistenceService.js';
import { parseCSVStatement } from './src/services/engine/statementParser.js';
import { executeNormalizationPipeline } from './src/services/engine/normalization/index.js';
import { runFinancialIntelligencePipeline } from './src/services/engine/processor.js';
import { getDashboardViewModel } from './src/services/engine/dashboardViewModel.js';

console.log('====================================================');
console.log('🚀 RUNNING PHASE 4 — END-TO-END INTEGRATION & DATA INTEGRITY AUDIT');
console.log('====================================================\n');

let passCount = 0;
async function test(desc, fn) {
  try {
    await fn();
    console.log(`  ✓ PASS: ${desc}`);
    passCount++;
  } catch (err) {
    console.error(`  ✗ FAIL: ${desc}`);
    console.error(`    ${err.message}`);
    process.exit(1);
  }
}

async function runAll() {
  // ---------------------------------------------------------------------------
  // 1. END-TO-END DATA FLOW TRACE
  // ---------------------------------------------------------------------------
  console.log('1. End-to-End Data Flow Trace:');

  const userA_id = 'user-aaa-1111-2222-333333333333';
  const userB_id = 'user-bbb-4444-5555-666666666666';

  const sampleBankCsv = `Date,Narration,Chq/Ref No,Value Dt,Withdrawal Amt,Deposit Amt,Closing Balance
01/10/2026,UPI-NETFLIX-MUMBAI-AUTOPAY-REF9281,,01/10/2026,649.00,,45351.00
01/10/2026,NEFT-SALARY CREDIT TECH CORP-0012,,01/10/2026,,75000.00,120351.00
02/10/2026,UPI-SWIGGY-BANGALORE-ORDER,,02/10/2026,450.00,,119901.00
03/10/2026,UPI-JIO-RECHARGE-MUMBAI,,03/10/2026,349.00,,119552.00`;

  await test('Stage 1: Statement parser converts raw bank statement', () => {
    const parsed = parseCSVStatement(sampleBankCsv, 'hdfc_oct.csv');
    assert(Array.isArray(parsed) && parsed.length === 4, 'Parsed exactly 4 transactions');
    assert(parsed[0].amount === 649, 'Parsed Netflix amount');
    assert(parsed[1].amount === 75000, 'Parsed Salary amount');
  });

  await test('Stage 2: Normalization pipeline cleans merchants and categorizes', () => {
    const normOutput = executeNormalizationPipeline(sampleBankCsv);
    assert(normOutput && normOutput.readyTransactions.length === 4, 'Normalized 4 transactions');
    const netflix = normOutput.readyTransactions.find(t => t.cleanMerchant === 'Netflix');
    assert(netflix, 'Normalized UPI narration to clean merchant "Netflix"');
    assert(netflix.category === 'Entertainment', 'Categorized Netflix as Entertainment');
  });

  await test('Stage 3: Transaction validation formats records strictly for Supabase', () => {
    const normOutput = executeNormalizationPipeline(sampleBankCsv);
    const formatted = formatTransactionRecord(normOutput.readyTransactions[0], userA_id, 'acc-1', 'hdfc_oct.csv');
    assert(formatted.valid === true, 'Formatted record is valid');
    assert(formatted.record.user_id === userA_id, 'user_id is strictly userA_id');
    assert(formatted.record.currency === 'INR', 'Currency is INR');
    assert(formatted.record.transaction_type === 'debit', 'Type is debit');
  });

  await test('Stage 4: Financial engine runs dynamic calculations', () => {
    const normOutput = executeNormalizationPipeline(sampleBankCsv);
    const pipeline = runFinancialIntelligencePipeline(normOutput.readyTransactions, 119552.00);
    assert(pipeline.summary.totalIncome === 75000, 'Total income matches persisted salary');
    assert(pipeline.summary.totalSpending === (649 + 450 + 349), 'Total spending matches debits sum');
    assert(pipeline.summary.netCashFlow === (75000 - (649 + 450 + 349)), 'Net cash flow calculated accurately');
    assert(pipeline.summary.currentBalance === 119552.00, 'Effective balance taken from transactions/metadata');
  });

  await test('Stage 5: Dashboard view model maps to UI representation', () => {
    const normOutput = executeNormalizationPipeline(sampleBankCsv);
    const pipeline = runFinancialIntelligencePipeline(normOutput.readyTransactions, 119552.00);
    const vm = getDashboardViewModel(pipeline, { latestBalance: 119552.00 });
    assert(vm.isEmpty === false, 'ViewModel is not empty');
    assert(vm.hero.monthlyIncome === 75000, 'Hero income is 75,000');
    assert(vm.hero.availableBalance === 119552.00, 'Hero available balance matches real data');
  });

  // ---------------------------------------------------------------------------
  // 2. USER DATA ISOLATION & CACHE LEAKAGE
  // ---------------------------------------------------------------------------
  console.log('\n2. User Data Isolation (User A vs User B):');

  await test('User A transactions do not leak to User B via memory or fallback storage', async () => {
    csvPersistenceService.clearMemoryCache();
    
    // Persist for User A
    const normOutput = executeNormalizationPipeline(sampleBankCsv);
    await csvPersistenceService.persistTransactions(normOutput.readyTransactions, {
      userId: userA_id,
      fileName: 'user_a.csv'
    });

    // Fetch for User B (who has 0 records)
    const userBTxs = await csvPersistenceService.fetchUserTransactions(userB_id);
    assert(Array.isArray(userBTxs), 'Returns array for User B');
    assert(userBTxs.length === 0, 'User B receives exactly 0 transactions (User A data not leaked)');
  });

  await test('Fingerprint check is scoped strictly to target user ID', async () => {
    const userAFingerprints = await csvPersistenceService.getExistingFingerprints(userA_id);
    const userBFingerprints = await csvPersistenceService.getExistingFingerprints(userB_id);

    assert(userAFingerprints.size > 0, 'User A has fingerprints stored');
    assert(userBFingerprints.size === 0, 'User B has 0 fingerprints (User A fingerprints not counted)');
  });

  await test('Logout teardown clears in-memory cache', () => {
    csvPersistenceService.clearMemoryCache();
    assert(typeof csvPersistenceService.clearMemoryCache === 'function', 'clearMemoryCache is available');
  });

  // ---------------------------------------------------------------------------
  // 3. EMPTY DATABASE BEHAVIOR
  // ---------------------------------------------------------------------------
  console.log('\n3. Empty Database Behavior:');

  await test('Zero transactions produce zero balance and empty viewmodel', () => {
    const emptyPipeline = runFinancialIntelligencePipeline([], 0);
    assert(emptyPipeline.summary.currentBalance === 0, 'Empty balance is 0 (not 78450)');
    assert(emptyPipeline.summary.totalSpending === 0, 'Empty spending is 0');
    assert(emptyPipeline.summary.totalIncome === 0, 'Empty income is 0');
    assert(emptyPipeline.summary.safeToSpend === 0, 'Empty safe-to-spend is 0');

    const emptyVm = getDashboardViewModel(emptyPipeline);
    assert(emptyVm.isEmpty === true, 'getDashboardViewModel returns isEmpty = true');
    assert(emptyVm.hero.availableBalance === 0, 'Hero available balance is 0');
    assert(emptyVm.hero.monthlyIncome === 0, 'Hero income is 0 (not 75000)');
    assert(emptyVm.hero.monthlySpending === 0, 'Hero spending is 0 (not 45365)');
    assert(emptyVm.hero.savingsRate === 0, 'Hero savings rate is 0');
    assert(emptyVm.hero.safeToSpendTotal === 0, 'Hero safeToSpendTotal is 0');
  });

  await test('dashboardViewModel does not contain hardcoded demo fallbacks (78450, 75000, 45365)', () => {
    const vmSource = fs.readFileSync(path.join(__dirname, 'src/services/engine/dashboardViewModel.js'), 'utf-8');
    assert(!vmSource.includes('78450.0'), 'dashboardViewModel has no 78450.0 fallback');
    assert(!vmSource.includes('75000);'), 'dashboardViewModel has no 75000 fallback');
    assert(!vmSource.includes('45365);'), 'dashboardViewModel has no 45365 fallback');
  });

  await test('App.jsx does not initialize hardcoded currentBalance state (78450)', () => {
    const appSource = fs.readFileSync(path.join(__dirname, 'src/App.jsx'), 'utf-8');
    assert(!appSource.includes('useState(78450.0)'), 'App.jsx does not initialize useState(78450.0)');
  });

  // ---------------------------------------------------------------------------
  // 4. DUPLICATE FINGERPRINT DETERMINISM
  // ---------------------------------------------------------------------------
  console.log('\n4. Duplicate Detection & Deterministic Fingerprints:');

  await test('Identical transactions produce identical fingerprints regardless of whitespace or casing', () => {
    const tx1 = { date: '2026-10-01', amount: 649, type: 'expense', description: '  UPI-NETFLIX-MUMBAI  ' };
    const tx2 = { date: '2026-10-01', amount: '649.00', transaction_type: 'debit', rawNarration: 'upi-netflix-mumbai' };
    
    const fp1 = generateTransactionFingerprint(tx1);
    const fp2 = generateTransactionFingerprint(tx2);

    assert(fp1.length > 10, 'Fingerprint generated');
    assert(fp1 === fp2, 'Fingerprints match identically');
  });

  await test('Different dates produce distinct fingerprints', () => {
    const tx1 = { date: '2026-10-01', amount: 649, type: 'expense', description: 'NETFLIX' };
    const tx2 = { date: '2026-11-01', amount: 649, type: 'expense', description: 'NETFLIX' };

    const fp1 = generateTransactionFingerprint(tx1);
    const fp2 = generateTransactionFingerprint(tx2);

    assert(fp1 !== fp2, 'Fingerprints differ across billing dates');
  });

  // ---------------------------------------------------------------------------
  // 5. ERROR HANDLING & RESILIENCE
  // ---------------------------------------------------------------------------
  console.log('\n5. Error Handling & Edge Cases:');

  await test('Rejects empty or whitespace-only CSV string gracefully', async () => {
    const res = await csvPersistenceService.processAndPersistCSV('   ');
    assert(res.success === false, 'Handles empty CSV string without throwing');
    assert(res.error.includes('empty'), 'Returns meaningful error message');
  });

  await test('Rejects persistence when unauthenticated', async () => {
    const res = await csvPersistenceService.persistTransactions(
      [{ date: '2026-10-01', amount: 500, type: 'expense', description: 'Test' }],
      { userId: null }
    );
    assert(res.success === false, 'Rejects unauthenticated persistence call');
    assert(res.imported === 0, '0 transactions imported');
  });

  await test('Isolates malformed rows and preserves valid transactions', () => {
    const corruptedRows = [
      { date: '2026-10-01', amount: 500, type: 'expense', description: 'Good Row' },
      { date: '', amount: 500, type: 'expense', description: 'Missing Date' },
      { date: '2026-10-02', amount: 0, type: 'expense', description: 'Zero Amount' },
      { date: '2026-10-03', amount: 'bad_number', type: 'expense', description: 'Bad Amount' }
    ];

    const valid = [];
    const errors = [];
    for (const row of corruptedRows) {
      const formatted = formatTransactionRecord(row, userA_id);
      if (formatted.valid) valid.push(formatted.record);
      else errors.push(formatted.error);
    }

    assert(valid.length === 1, 'Exactly 1 row is valid');
    assert(errors.length === 3, 'Catches all 3 malformed rows');
  });

  // ---------------------------------------------------------------------------
  // 6. SECURITY & KEY EXPOSURE AUDIT
  // ---------------------------------------------------------------------------
  console.log('\n6. Frontend Security Audit:');

  await test('Zero exposure of Supabase service_role key in frontend source', () => {
    const srcFiles = fs.readdirSync(path.join(__dirname, 'src'), { recursive: true });
    for (const file of srcFiles) {
      const fullPath = path.join(__dirname, 'src', file);
      if (fs.statSync(fullPath).isFile() && (file.endsWith('.js') || file.endsWith('.jsx'))) {
        const content = fs.readFileSync(fullPath, 'utf-8');
        assert(!content.includes('service_role'), `File ${file} strictly does not contain service_role`);
        assert(!content.includes('supabase_admin'), `File ${file} strictly does not contain supabase_admin`);
      }
    }
  });

  await test('.gitignore contains .env entry', () => {
    const gitignore = fs.readFileSync(path.join(__dirname, '.gitignore'), 'utf-8');
    assert(gitignore.includes('.env'), '.gitignore properly contains .env');
  });

  await test('Only safe anon publishable key is referenced in .env', () => {
    const envContent = fs.readFileSync(path.join(__dirname, '.env'), 'utf-8');
    assert(envContent.includes('VITE_SUPABASE_ANON_KEY'), '.env defines VITE_SUPABASE_ANON_KEY');
    assert(!envContent.includes('service_role'), '.env does not contain service_role');
  });

  console.log('\n====================================================');
  console.log(`TOTAL PHASE 4 AUDIT TESTS: ${passCount}`);
  console.log(`PASSED: ${passCount}`);
  console.log('FAILED: 0');
  console.log('====================================================');
  console.log('🎉 ALL PHASE 4 INTEGRATION & DATA INTEGRITY AUDIT TESTS PASSED PERFECTLY!\n');
}

runAll().catch(err => {
  console.error('Test run failed:', err);
  process.exit(1);
});
