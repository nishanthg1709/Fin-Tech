/**
 * Comprehensive Transaction Normalization Pipeline Test Suite
 * Validates all 12+ test cases specified in Section 20 of the requirements:
 * 
 * 1. SBI-style CSV
 * 2. HDFC-style CSV
 * 3. CSV with Date/Narration/Withdrawal/Deposit
 * 4. CSV with Transaction Date/Description/Debit/Credit
 * 5. Different date formats (DD/MM/YYYY, DD-Mon-YYYY, YYYY-MM-DD, DD.MM.YYYY, invalid)
 * 6. Income transactions (Credits, CR, Salary)
 * 7. Expense transactions (Debits, DR, POS)
 * 8. Unknown merchant (Algorithmic cleansing + original_description preserved)
 * 9. Duplicate transaction (Deterministic fingerprinting & skipping)
 * 10. Missing column error handling
 * 11. Invalid amount flagged for review
 * 12. Unknown transaction type flagged for review
 * 13. Transfer detection (UPI/IMPS/NEFT transfers)
 * 14. Equivalence Proof: Different input formats -> Same canonical transaction format
 */

import {
  parseCSVRaw,
  detectColumns,
  normalizeDate,
  normalizeAmountAndType,
  normalizeMerchant,
  assignCategory,
  detectTransfer,
  validateTransaction,
  generateFingerprint,
  detectDuplicates,
  normalizeTransactionRow,
  analyzeCSVStructure,
  executeNormalizationPipeline
} from './src/services/engine/normalization/index.js';

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
console.log('🚀 RUNNING TRANSACTION NORMALIZATION PIPELINE TESTS');
console.log('====================================================\n');

// -----------------------------------------------------------------
// Test 1: SBI-style CSV
// -----------------------------------------------------------------
console.log('1. SBI-Style CSV Format:');
const sbiCsv = `Txn Date,Description,Ref No./Cheque No.,Debit,Credit,Balance
08-Oct-2026,UPI-AMAZON-92831-MUMBAI,REF10029,1499.00,,85200.00
01-Oct-2026,NEFT-SALARY-CREDIT-CORP,REF10030,,85000.00,86699.00`;

const sbiResult = executeNormalizationPipeline(sbiCsv, 'SBI_Statement_Oct2026.csv');
assert(sbiResult.readyTransactions.length === 2, 'SBI CSV imported exactly 2 transactions');
assert(sbiResult.metadata.detectedBank === 'State Bank of India (SBI)', 'Detected SBI bank signature');

const sbiTx1 = sbiResult.readyTransactions[0];
assert(sbiTx1.date === '2026-10-08', 'SBI Date converted from 08-Oct-2026 to YYYY-MM-DD');
assert(sbiTx1.merchant === 'Amazon', 'SBI Amazon merchant normalized correctly');
assert(sbiTx1.original_description === 'UPI-AMAZON-92831-MUMBAI', 'Original bank description preserved untouched');
assert(sbiTx1.amount === 1499, 'Positive numeric amount without formatting');
assert(sbiTx1.type === 'expense', 'Debit column mapped to expense type');
assert(sbiTx1.category === 'Shopping', 'Amazon categorized as Shopping');
assert(sbiTx1.balance === 85200, 'SBI balance captured');
assert(sbiTx1.source === 'csv', 'Source is csv');
assert(sbiTx1.is_reviewed === true, 'Valid transaction marked is_reviewed');

// -----------------------------------------------------------------
// Test 2: HDFC-style CSV
// -----------------------------------------------------------------
console.log('\n2. HDFC-Style CSV Format:');
const hdfcCsv = `Date,Narration,Chq/Ref No,Value Dt,Withdrawal Amt,Deposit Amt,Closing Balance
08/10/2026,SWIGGY*ORDER123-BANGALORE,HDFC9982,08/10/2026,456.00,,74500.50
07/10/2026,UPI-NETFLIX-MUMBAI-AUTOPAY,HDFC9983,07/10/2026,799.00,,74956.50`;

const hdfcResult = executeNormalizationPipeline(hdfcCsv, 'HDFC_Oct2026.csv');
assert(hdfcResult.readyTransactions.length === 2, 'HDFC CSV imported 2 transactions');
assert(hdfcResult.metadata.detectedBank === 'HDFC Bank', 'Detected HDFC bank signature');

const hdfcTx1 = hdfcResult.readyTransactions[0];
assert(hdfcTx1.date === '2026-10-08', 'HDFC Date converted from 08/10/2026 to 2026-10-08');
assert(hdfcTx1.merchant === 'Swiggy', 'Swiggy merchant normalized');
assert(hdfcTx1.category === 'Food', 'Swiggy categorized as Food');
assert(hdfcTx1.type === 'expense', 'Withdrawal Amt mapped to expense');
assert(hdfcTx1.amount === 456, 'Swiggy amount is 456');

// -----------------------------------------------------------------
// Test 3: CSV with Date/Narration/Withdrawal/Deposit
// -----------------------------------------------------------------
console.log('\n3. CSV with Date / Narration / Withdrawal / Deposit:');
const genericCsv1 = `Date,Narration,Withdrawal,Deposit,Balance
2026-10-08,UBER INDIA TRIP RIDE,350.00,,42000.00
2026-10-05,INTEREST CREDIT,,1250.00,42350.00`;

const genericResult1 = executeNormalizationPipeline(genericCsv1, 'statement_generic.csv');
assert(genericResult1.readyTransactions.length === 2, 'Parsed 2 rows from generic Date/Narration/Withdrawal/Deposit CSV');
assert(genericResult1.readyTransactions[0].merchant === 'Uber', 'Uber normalized');
assert(genericResult1.readyTransactions[0].category === 'Transport', 'Uber categorized as Transport');
assert(genericResult1.readyTransactions[0].type === 'expense', 'Withdrawal is expense');
assert(genericResult1.readyTransactions[1].type === 'income', 'Deposit is income');
assert(genericResult1.readyTransactions[1].amount === 1250, 'Income amount positive 1250');

// -----------------------------------------------------------------
// Test 4: CSV with Transaction Date/Description/Debit/Credit
// -----------------------------------------------------------------
console.log('\n4. CSV with Transaction Date / Description / Debit / Credit:');
const genericCsv2 = `Transaction Date,Description,Debit,Credit,Balance
2026-10-08,APOLLO PHARMACY BANGALORE,850.00,,61000.00
2026-10-07,SPOTIFY INDIA SUBSCRIPTION,119.00,,61850.00`;

const genericResult2 = executeNormalizationPipeline(genericCsv2, 'custom_bank.csv');
assert(genericResult2.readyTransactions.length === 2, 'Parsed 2 rows from Transaction Date/Description/Debit/Credit CSV');
assert(genericResult2.readyTransactions[0].merchant === 'Apollo Pharmacy', 'Apollo Pharmacy normalized');
assert(genericResult2.readyTransactions[0].category === 'Healthcare', 'Apollo Pharmacy categorized as Healthcare');
assert(genericResult2.readyTransactions[1].merchant === 'Spotify', 'Spotify normalized');
assert(genericResult2.readyTransactions[1].category === 'Entertainment', 'Spotify categorized as Entertainment');

// -----------------------------------------------------------------
// Test 5: Different Date Formats
// -----------------------------------------------------------------
console.log('\n5. Date Normalization:');
assert(normalizeDate('08/10/2026').date === '2026-10-08', 'Normalized DD/MM/YYYY');
assert(normalizeDate('08-Oct-2026').date === '2026-10-08', 'Normalized DD-Mon-YYYY');
assert(normalizeDate('2026-10-08').date === '2026-10-08', 'Normalized ISO YYYY-MM-DD');
assert(normalizeDate('08.10.2026').date === '2026-10-08', 'Normalized DD.MM.YYYY');
assert(normalizeDate('October 08, 2026').date === '2026-10-08', 'Normalized Month DD, YYYY');
assert(normalizeDate('31/02/2026').isValid === false, 'Rejected non-existent calendar date (Feb 31)');
assert(normalizeDate('invalid-date-string').isValid === false, 'Flagged invalid date string for review');

// -----------------------------------------------------------------
// Test 6 & 7: Income and Expense Transactions
// -----------------------------------------------------------------
console.log('\n6 & 7. Income & Expense Normalization:');
// Debit column = expense
const debitRes = normalizeAmountAndType({ rawDebit: '1,499.00', rawCredit: '' });
assert(debitRes.amount === 1499 && debitRes.type === 'expense', 'Debit = 1499 becomes amount: 1499, type: expense');

// Credit column = income
const creditRes = normalizeAmountAndType({ rawDebit: '', rawCredit: '85,000.00' });
assert(creditRes.amount === 85000 && creditRes.type === 'income', 'Credit = 85000 becomes amount: 85000, type: income');

// Amount + Dr flag
const drRes = normalizeAmountAndType({ rawAmount: '₹ 1,499', rawType: 'DR' });
assert(drRes.amount === 1499 && drRes.type === 'expense', 'Amount: 1499 with Type: DR becomes amount: 1499, type: expense');

// Amount + Cr flag
const crRes = normalizeAmountAndType({ rawAmount: '₹ 85,000', rawType: 'CR' });
assert(crRes.amount === 85000 && crRes.type === 'income', 'Amount: 85000 with Type: CR becomes amount: 85000, type: income');

// Signed negative amount
const negRes = normalizeAmountAndType({ rawAmount: '-450.00' });
assert(negRes.amount === 450 && negRes.type === 'expense', 'Negative signed amount becomes positive amount: 450, type: expense');

// Never store negative numbers in canonical amount
assert(debitRes.amount >= 0 && creditRes.amount >= 0 && drRes.amount >= 0 && negRes.amount >= 0, 'All canonical amounts are strictly non-negative');

// -----------------------------------------------------------------
// Test 8: Unknown Merchant Handling
// -----------------------------------------------------------------
console.log('\n8. Unknown Merchant Handling:');
const unknownDesc = 'POS-LOCAL CORNER BAKERY-BENGALURU 560034';
const normUnknown = normalizeMerchant(unknownDesc);
assert(normUnknown.merchant === 'Local Corner Bakery', `Algorithmic cleansing to title case (got "${normUnknown.merchant}")`);
assert(normUnknown.isRecognized === false, 'Correctly flagged as unknown / non-dictionary');

const rowUnknown = normalizeTransactionRow(['2026-10-08', unknownDesc, '250', ''], {
  date: 0,
  description: 1,
  debit: 2,
  credit: 3
});
assert(rowUnknown.merchant === 'Local Corner Bakery', 'Canonical merchant set to cleansed title');
assert(rowUnknown.original_description === unknownDesc, 'Original bank description preserved exactly untouched');
assert(rowUnknown.category === 'Food', 'Categorized under Food due to bakery keyword');

// -----------------------------------------------------------------
// Test 9: Duplicate Detection
// -----------------------------------------------------------------
console.log('\n9. Duplicate Transaction Detection:');
const dupCsv = `Date,Description,Debit,Credit
2026-10-08,POS-STARBUCKS-BANDRA,350,,
2026-10-08,POS-STARBUCKS-BANDRA,350,,
2026-10-07,SWIGGY ORDER,420,,`;

const dupResult = executeNormalizationPipeline(dupCsv, 'test_duplicates.csv');
assert(dupResult.stats.totalRows === 3, 'Total 3 rows detected');
assert(dupResult.stats.readyCount === 2, '2 unique transactions ready');
assert(dupResult.stats.duplicateCount === 1, '1 duplicate transaction identified');
assert(dupResult.duplicateTransactions[0].is_duplicate === true, 'Duplicate transaction marked is_duplicate = true');

// Deduplicate against existing dataset
const existingRecord = dupResult.readyTransactions[0];
const dedupeAgainstExisting = detectDuplicates([existingRecord], [existingRecord]);
assert(dedupeAgainstExisting.duplicateCount === 1, 'Detected duplicate when re-importing identical existing record');

// -----------------------------------------------------------------
// Test 10: Missing Column Error Handling
// -----------------------------------------------------------------
console.log('\n10. Missing Required Column Error Handling:');
const missingDateCsv = `Description,Debit,Credit
Amazon Shopping,1499,`;

let caughtDateErr = false;
try {
  executeNormalizationPipeline(missingDateCsv, 'bad_date.csv');
} catch (err) {
  caughtDateErr = true;
  assert(err.message.includes('Missing required column: date'), 'Reported missing date column clearly');
}
assert(caughtDateErr, 'Threw error on missing date column');

const missingAmtCsv = `Date,Description
2026-10-08,Amazon Shopping`;

let caughtAmtErr = false;
try {
  executeNormalizationPipeline(missingAmtCsv, 'bad_amt.csv');
} catch (err) {
  caughtAmtErr = true;
  assert(err.message.includes('Missing required amount column'), 'Reported missing amount column clearly');
}
assert(caughtAmtErr, 'Threw error on missing amount column');

// -----------------------------------------------------------------
// Test 11: Invalid Amount Flagged for Review
// -----------------------------------------------------------------
console.log('\n11. Invalid Amount Handling:');
const invalidAmtCsv = `Date,Description,Debit,Credit
2026-10-08,Amazon Shopping,INVALID_AMT,,
2026-10-07,Swiggy Order,350,,`;

const invalidAmtResult = executeNormalizationPipeline(invalidAmtCsv, 'invalid_amt.csv');
assert(invalidAmtResult.stats.readyCount === 1, '1 valid transaction ready');
assert(invalidAmtResult.stats.needsReviewCount === 1, '1 invalid transaction routed to needs_review');
assert(invalidAmtResult.needsReviewTransactions[0].validation_errors.some(e => e.includes('Amount')), 'Included descriptive error for invalid amount');

// -----------------------------------------------------------------
// Test 12: Unknown Transaction Type / Contradictory Debit+Credit
// -----------------------------------------------------------------
console.log('\n12. Unknown Transaction Type & Conflicting Row Handling:');
const contradictoryCsv = `Date,Description,Debit,Credit
2026-10-08,Suspicious Bank Item,1500,2000`;

const contradictoryResult = executeNormalizationPipeline(contradictoryCsv, 'contradictory.csv');
assert(contradictoryResult.stats.needsReviewCount === 1, 'Row with both debit & credit flagged for review');
assert(contradictoryResult.needsReviewTransactions[0].validation_errors.some(e => e.includes('Both debit and credit')), 'Error explains both debit and credit were found');

// -----------------------------------------------------------------
// Test 13: Transfer Detection
// -----------------------------------------------------------------
console.log('\n13. Internal and Peer Transfer Detection:');
const upiTrf = normalizeTransactionRow(['2026-10-08', 'UPI TRANSFER TO RAHUL SHARMA', '5000', ''], {
  date: 0, description: 1, debit: 2, credit: 3
});
assert(upiTrf.type === 'transfer', 'UPI transfer identified with type = transfer');
assert(upiTrf.category === 'Transfer', 'UPI transfer assigned category = Transfer (not Food/Shopping)');

const impsTrf = normalizeTransactionRow(['2026-10-07', 'IMPS TRANSFER FROM SAVINGS A/C', '', '25000'], {
  date: 0, description: 1, debit: 2, credit: 3
});
assert(impsTrf.type === 'transfer', 'IMPS transfer identified with type = transfer');
assert(impsTrf.category === 'Transfer', 'IMPS transfer assigned category = Transfer');

const normalUpiPurchase = normalizeTransactionRow(['2026-10-08', 'UPI-AMAZON-PAY-ORDER', '1299', ''], {
  date: 0, description: 1, debit: 2, credit: 3
});
assert(normalUpiPurchase.type === 'expense', 'UPI merchant purchase is NOT misclassified as transfer');
assert(normalUpiPurchase.category === 'Shopping', 'UPI Amazon purchase categorized as Shopping');

// -----------------------------------------------------------------
// Test 14: Canonical Format Equivalence Proof
// -----------------------------------------------------------------
console.log('\n14. Canonical Format Equivalence Proof (Different Input Formats -> Same Canonical Model):');

// Format A: SBI Style
const sbiLine = ['08-Oct-2026', 'UPI-AMAZON-92831', 'REF123', '1499.00', '', '85000.00'];
const sbiMapping = { date: 0, description: 1, transaction_id: 2, debit: 3, credit: 4, balance: 5 };
const canonicalFromSbi = normalizeTransactionRow(sbiLine, sbiMapping, { account: 'SBI' });

// Format B: HDFC Style
const hdfcLine = ['08/10/2026', 'AMAZON PAY INDIA MUMBAI', 'HDFC456', '08/10/2026', '1499.00', '', '85000.00'];
const hdfcMapping = { date: 0, description: 1, transaction_id: 2, debit: 4, credit: 5, balance: 6 };
const canonicalFromHdfc = normalizeTransactionRow(hdfcLine, hdfcMapping, { account: 'HDFC' });

// Format C: Single Amount + Type Column (US / Modern Fintech Style)
const modernLine = ['2026-10-08', 'AMZN Mktp US*9912', '1499.00', 'DR', '85000.00'];
const modernMapping = { date: 0, description: 1, amount: 2, type: 3, balance: 4 };
const canonicalFromModern = normalizeTransactionRow(modernLine, modernMapping, { account: 'Fintech' });

// Assert equivalence across key canonical properties
assert(canonicalFromSbi.date === canonicalFromHdfc.date && canonicalFromHdfc.date === canonicalFromModern.date, 'Identical canonical date (2026-10-08) across all 3 formats');
assert(canonicalFromSbi.merchant === canonicalFromHdfc.merchant && canonicalFromHdfc.merchant === canonicalFromModern.merchant, 'Identical canonical merchant ("Amazon") across all 3 formats');
assert(canonicalFromSbi.amount === canonicalFromHdfc.amount && canonicalFromHdfc.amount === canonicalFromModern.amount, 'Identical canonical amount (1499) across all 3 formats');
assert(canonicalFromSbi.type === canonicalFromHdfc.type && canonicalFromHdfc.type === canonicalFromModern.type, 'Identical canonical type ("expense") across all 3 formats');
assert(canonicalFromSbi.category === canonicalFromHdfc.category && canonicalFromHdfc.category === canonicalFromModern.category, 'Identical canonical category ("Shopping") across all 3 formats');
assert(canonicalFromSbi.source === canonicalFromHdfc.source && canonicalFromHdfc.source === canonicalFromModern.source, 'Identical canonical source ("csv") across all 3 formats');

// Assert original_description was preserved individually and NOT overwritten
assert(canonicalFromSbi.original_description === 'UPI-AMAZON-92831', 'SBI original description preserved');
assert(canonicalFromHdfc.original_description === 'AMAZON PAY INDIA MUMBAI', 'HDFC original description preserved');
assert(canonicalFromModern.original_description === 'AMZN Mktp US*9912', 'Modern original description preserved');

// -----------------------------------------------------------------
// Test 15: Structure Analysis & Column Mapping UI Assistance (Section 4 & 16)
// -----------------------------------------------------------------
console.log('\n15. Column Auto-Detection & Interactive Mapping Screen Data:');
const autoDetectableCsv = `Date,Narration,Withdrawal Amt,Deposit Amt,Closing Balance
2026-10-08,Swiggy,450,,50000`;
const autoAnalysis = analyzeCSVStructure(autoDetectableCsv);
assert(autoAnalysis.isConfident === true, 'Auto-detects familiar bank statement with high confidence (isConfident = true)');
assert(autoAnalysis.detectedColumns.length >= 4, 'Mapped date, narration, withdrawal, deposit, balance');

const unknownBankCsv = `CustomColA,CustomColB,CustomColC,CustomColD
2026-10-08,Some Transaction,1000,50000`;
const unknownAnalysis = analyzeCSVStructure(unknownBankCsv);
assert(unknownAnalysis.isConfident === false, 'Low confidence on unknown bank column headers (triggers mapping UI)');
assert(unknownAnalysis.missingRequired.length > 0, 'Identifies missing required mappings for user selection');

console.log('\n====================================================');
console.log(`TOTAL NORMALIZATION TESTS: ${passed + failed}`);
console.log(`PASSED: ${passed}`);
console.log(`FAILED: ${failed}`);
console.log('====================================================');

if (failed > 0) {
  process.exit(1);
} else {
  console.log('🎉 ALL NORMALIZATION PIPELINE TESTS PASSED PERFECTLY!\n');
}
