/**
 * Bank Statement Column Detector
 * Intelligently maps bank statement headers to canonical Smart Expense fields using
 * normalized string comparisons and comprehensive alias patterns.
 */

// Normalized alias mappings for canonical fields
export const CANONICAL_FIELD_ALIASES = {
  date: [
    'date',
    'transaction_date',
    'txn_date',
    'trans_date',
    'posted_date',
    'posting_date',
    'post_date',
    'value_date',
    'value_dt',
    'booking_date',
    'trade_date'
  ],
  description: [
    'description',
    'narration',
    'particulars',
    'transaction_details',
    'transaction_description',
    'txn_description',
    'remarks',
    'remark',
    'reference',
    'memo',
    'details',
    'note',
    'narrative',
    'desc',
    'raw_narration'
  ],
  debit: [
    'debit',
    'withdrawal',
    'withdrawal_amount',
    'withdrawal_amt',
    'dr',
    'debit_amount',
    'debit_inr',
    'expense',
    'paid_out',
    'out',
    'debits'
  ],
  credit: [
    'credit',
    'deposit',
    'deposit_amount',
    'deposit_amt',
    'cr',
    'credit_amount',
    'credit_inr',
    'income',
    'paid_in',
    'in',
    'credits'
  ],
  amount: [
    'amount',
    'amt',
    'value',
    'txn_amount',
    'transaction_amount',
    'total_amount',
    'net_amount'
  ],
  type: [
    'type',
    'dr_cr',
    'cr_dr',
    'drcr',
    'txn_type',
    'transaction_type',
    'data_type',
    'mode',
    'payment_mode',
    'channel'
  ],
  balance: [
    'balance',
    'closing_balance',
    'available_balance',
    'running_balance',
    'account_balance',
    'balance_inr',
    'closing_bal',
    'bal'
  ],
  account: [
    'account',
    'account_no',
    'account_number',
    'acc_no',
    'bank',
    'bank_name',
    'account_name'
  ],
  merchant: [
    'merchant',
    'clean_merchant',
    'payee',
    'vendor',
    'party_name',
    'merchant_name',
    'beneficiary',
    'receiver'
  ],
  category: [
    'category',
    'cat',
    'tag',
    'expense_category',
    'suggested_category'
  ],
  transaction_id: [
    'transaction_id',
    'txn_id',
    'tx_id',
    'id',
    'ref_no',
    'reference_no',
    'reference_number',
    'ref_no_cheque_no',
    'cheque_no',
    'cheque_number',
    'chq_ref_no',
    'chq_no',
    'utr',
    'utr_number'
  ]
};

/**
 * Normalizes a header string for comparison:
 * lowercase, replaces spaces, slashes, dashes, dots with underscores, collapses repeats.
 * @param {string} str
 * @returns {string}
 */
export function normalizeHeader(str) {
  if (!str || typeof str !== 'string') return '';
  return str
    .toLowerCase()
    .trim()
    .replace(/[\s/\\.-]+/g, '_')
    .replace(/[^a-z0-9_]/g, '')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');
}

/**
 * Detects column mapping from an array of raw header strings.
 * @param {string[]} rawHeaders
 * @param {string[][]} [sampleRows=[]] First few data rows to help disambiguate
 * @returns {{
 *   mapping: Object,
 *   detectedColumns: Array,
 *   unmappedHeaders: string[],
 *   isConfident: boolean,
 *   detectedBank: string|null,
 *   missingRequired: string[]
 * }}
 */
export function detectColumns(rawHeaders, sampleRows = []) {
  if (!Array.isArray(rawHeaders) || rawHeaders.length === 0) {
    return {
      mapping: {},
      detectedColumns: [],
      unmappedHeaders: [],
      isConfident: false,
      detectedBank: null,
      missingRequired: ['date', 'amount_or_debit_credit']
    };
  }

  const normalizedHeaders = rawHeaders.map(h => normalizeHeader(h));
  const mapping = {}; // canonicalKey -> rawHeaderIndex
  const usedIndices = new Set();
  const detectedColumns = [];

  // Pass 1: Exact matches against alias dictionary
  for (const [canonicalKey, aliases] of Object.entries(CANONICAL_FIELD_ALIASES)) {
    for (let idx = 0; idx < normalizedHeaders.length; idx++) {
      if (usedIndices.has(idx)) continue;
      const norm = normalizedHeaders[idx];

      if (aliases.includes(norm)) {
        mapping[canonicalKey] = idx;
        usedIndices.add(idx);
        detectedColumns.push({
          canonicalKey,
          rawHeader: rawHeaders[idx],
          index: idx,
          matchType: 'exact'
        });
        break; // Match first occurrence for this canonical key
      }
    }
  }

  // Pass 2: Fuzzy / substring matches for fields not yet mapped (for aliases >= 4 chars)
  for (const [canonicalKey, aliases] of Object.entries(CANONICAL_FIELD_ALIASES)) {
    if (mapping[canonicalKey] !== undefined) continue;

    for (let idx = 0; idx < normalizedHeaders.length; idx++) {
      if (usedIndices.has(idx)) continue;
      const norm = normalizedHeaders[idx];

      // Guard: do not let amount/debit/credit match date columns (e.g. value_dt, value_date)
      if ((canonicalKey === 'amount' || canonicalKey === 'debit' || canonicalKey === 'credit') && 
          (norm.includes('date') || norm.includes('dt'))) {
        continue;
      }

      // Exclude short 2-character aliases from substring search (like 'dr', 'cr', 'in')
      const matchedAlias = aliases.find(a => a.length >= 4 && (norm.includes(a) || a.includes(norm)));
      if (matchedAlias) {
        mapping[canonicalKey] = idx;
        usedIndices.add(idx);
        detectedColumns.push({
          canonicalKey,
          rawHeader: rawHeaders[idx],
          index: idx,
          matchType: 'partial'
        });
        break;
      }
    }
  }

  // Identify unmapped headers
  const unmappedHeaders = rawHeaders.filter((_, idx) => !usedIndices.has(idx));

  // Verify Required Fields:
  // Must have 'date'
  // Must have ('debit' or 'credit') OR ('amount')
  const missingRequired = [];
  if (mapping.date === undefined) {
    missingRequired.push('date');
  }
  if (mapping.debit === undefined && mapping.credit === undefined && mapping.amount === undefined) {
    missingRequired.push('debit_or_credit_or_amount');
  }

  // Detect bank profile if signature matches
  let detectedBank = null;
  const headerStr = normalizedHeaders.join(' ');
  if ((headerStr.includes('txn_date') || headerStr.includes('sbi')) && (headerStr.includes('ref_no') || headerStr.includes('cheque_no') || headerStr.includes('ref_no_cheque_no'))) {
    detectedBank = 'State Bank of India (SBI)';
  } else if ((headerStr.includes('narration') || headerStr.includes('hdfc')) && (headerStr.includes('chq') || headerStr.includes('closing_balance') || headerStr.includes('withdrawal_amt'))) {
    detectedBank = 'HDFC Bank';
  } else if (headerStr.includes('particulars') && (headerStr.includes('dr') || headerStr.includes('cr'))) {
    detectedBank = 'ICICI Bank';
  } else if (headerStr.includes('debit_inr') && headerStr.includes('credit_inr')) {
    detectedBank = 'Standard FinTech Export';
  }

  // High confidence if required fields are present and description is present
  const isConfident = missingRequired.length === 0 && (mapping.description !== undefined || mapping.merchant !== undefined);

  return {
    mapping,
    detectedColumns,
    unmappedHeaders,
    isConfident,
    detectedBank,
    missingRequired
  };
}
