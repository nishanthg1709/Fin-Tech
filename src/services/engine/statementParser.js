/**
 * Bank Statement CSV Parser & Validator
 * Supports real-world bank CSV files with flexible column mappings,
 * specifically handling the target schema:
 * transaction_id, date, description, merchant, category, debit_inr, credit_inr, balance_inr, payment_mode, recurring, billing_cycle_months, status, data_type
 */

export const COLUMN_ALIASES = {
  transaction_id: ['transaction_id', 'transactionid', 'tx_id', 'txid', 'id', 'ref_no', 'reference_no', 'reference', 'txn_id'],
  date: ['date', 'trans_date', 'transaction_date', 'posted_date', 'posted', 'txn_date', 'value_date'],
  description: ['description', 'narration', 'desc', 'raw_narration', 'details', 'memo', 'particulars', 'remark'],
  merchant: ['merchant', 'clean_merchant', 'payee', 'vendor', 'party_name', 'merchant_name', 'beneficiary'],
  category: ['category', 'cat', 'expense_category', 'tag'],
  debit: ['debit_inr', 'debit', 'withdrawal', 'withdrawal_amount', 'dr', 'expense', 'out', 'debit_amount'],
  credit: ['credit_inr', 'credit', 'deposit', 'deposit_amount', 'cr', 'income', 'in', 'credit_amount'],
  amount: ['amount', 'amt', 'value', 'txn_amount', 'transaction_amount'],
  balance: ['balance_inr', 'balance', 'closing_balance', 'available_balance', 'bal'],
  payment_mode: ['payment_mode', 'payment_method', 'mode', 'channel', 'method', 'type_mode'],
  recurring: ['recurring', 'is_recurring', 'subscription', 'is_subscription', 'repeat'],
  billing_cycle_months: ['billing_cycle_months', 'billing_cycle', 'cycle_months', 'frequency_months', 'interval_months', 'cycle'],
  status: ['status', 'tx_status', 'transaction_status', 'state'],
  data_type: ['data_type', 'datatype', 'type_flag']
};

/**
 * Validates and parses a CSV statement string into normalized transactions with rich metadata.
 * Returns an array with metadata attached, maintaining full backwards compatibility.
 * @param {string} csvString
 * @param {string} [fileName='bank_statement.csv']
 * @returns {Array} Array of transactions with attached .metadata property
 */
export function parseCSVStatement(csvString, fileName = 'bank_statement.csv') {
  if (!csvString || typeof csvString !== 'string' || csvString.trim().length === 0) {
    throw new Error('The selected file is empty. Please provide a valid CSV file with transaction data.');
  }

  const lines = csvString
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line.length > 0);

  if (lines.length < 2) {
    throw new Error('CSV must contain a header row and at least one transaction row.');
  }

  // Parse header
  const rawHeaders = splitCSVLine(lines[0]);
  const cleanHeaders = rawHeaders.map(h => h.trim().toLowerCase().replace(/[\s_-]+/g, '_'));

  // Detect columns via alias mappings
  const colMap = {};
  const detectedColumns = [];

  for (const [standardKey, aliases] of Object.entries(COLUMN_ALIASES)) {
    // 1. Exact match first
    let idx = cleanHeaders.findIndex(h => aliases.includes(h));
    // 2. Partial match fallback only for aliases of length >= 4 to avoid 2-letter collisions
    if (idx === -1) {
      idx = cleanHeaders.findIndex(h => aliases.some(alias => alias.length >= 4 && (h.includes(alias) || alias.includes(h))));
    }
    if (idx !== -1) {
      colMap[standardKey] = idx;
      detectedColumns.push({
        standard: standardKey,
        header: rawHeaders[idx],
        index: idx
      });
    }
  }

  // Strict Validation: date is required
  if (colMap.date === undefined) {
    throw new Error("We couldn't analyze this file. Missing required column: date.");
  }

  // Strict Validation: at least one amount-related column must exist
  if (colMap.debit === undefined && colMap.credit === undefined && colMap.amount === undefined) {
    throw new Error("We couldn't analyze this file. Missing required amount column: debit_inr, credit_inr, or amount.");
  }

  const transactions = [];
  let totalDebit = 0;
  let totalCredit = 0;
  let latestBalance = null;
  const dates = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = splitCSVLine(lines[i]);
    if (cols.length === 0 || cols.every(c => !c || c.trim() === '')) {
      continue; // Skip empty rows safely
    }

    const rawDate = cols[colMap.date]?.trim();
    if (!rawDate) continue;

    const parsedDate = parseDateString(rawDate);
    if (!parsedDate) continue;

    // Parse Debit, Credit, Amount
    let debitVal = 0;
    let creditVal = 0;
    let amount = 0;
    let type = 'DEBIT';

    if (colMap.debit !== undefined && cols[colMap.debit]) {
      debitVal = parseNumber(cols[colMap.debit]);
    }
    if (colMap.credit !== undefined && cols[colMap.credit]) {
      creditVal = parseNumber(cols[colMap.credit]);
    }

    if (debitVal > 0) {
      amount = debitVal;
      type = 'DEBIT';
      totalDebit += debitVal;
    } else if (creditVal > 0) {
      amount = creditVal;
      type = 'CREDIT';
      totalCredit += creditVal;
    } else if (colMap.amount !== undefined && cols[colMap.amount]) {
      const parsedAmt = parseNumber(cols[colMap.amount]);
      if (parsedAmt < 0) {
        amount = Math.abs(parsedAmt);
        type = 'DEBIT';
        totalDebit += amount;
      } else if (parsedAmt > 0) {
        // Check if there is a type column
        const rawType = cols[colMap.data_type] || cols[colMap.status] || '';
        if (/credit|deposit|in/i.test(rawType)) {
          amount = parsedAmt;
          type = 'CREDIT';
          totalCredit += amount;
        } else {
          amount = parsedAmt;
          type = 'DEBIT';
          totalDebit += amount;
        }
      }
    }

    // Skip transactions with zero or invalid amount
    if (isNaN(amount) || amount <= 0) {
      continue;
    }

    // Parse Description & Merchant
    const rawDesc = colMap.description !== undefined ? cols[colMap.description]?.trim() : '';
    const rawMerchant = colMap.merchant !== undefined ? cols[colMap.merchant]?.trim() : '';
    const cleanMerchant = rawMerchant || rawDesc || 'Unknown Merchant';
    const rawNarration = rawDesc || cleanMerchant;

    // Parse Category
    const category = colMap.category !== undefined && cols[colMap.category] 
      ? cols[colMap.category].trim() 
      : 'Other';

    // Parse Balance
    let balanceVal = null;
    if (colMap.balance !== undefined && cols[colMap.balance]) {
      balanceVal = parseNumber(cols[colMap.balance]);
      if (!isNaN(balanceVal)) {
        latestBalance = balanceVal;
      }
    }

    // Parse Payment Mode
    const paymentMode = colMap.payment_mode !== undefined && cols[colMap.payment_mode]
      ? cols[colMap.payment_mode].trim()
      : 'Electronic';

    // Parse Recurring & Billing Cycle
    let isExplicitRecurring = false;
    if (colMap.recurring !== undefined && cols[colMap.recurring]) {
      const recStr = cols[colMap.recurring].trim().toLowerCase();
      isExplicitRecurring = recStr === 'true' || recStr === '1' || recStr === 'yes' || recStr === 'y';
    }

    let billingCycleMonths = 1;
    let billingCycleText = '1 Month';
    if (colMap.billing_cycle_months !== undefined && cols[colMap.billing_cycle_months]) {
      const parsedMonths = parseInt(cols[colMap.billing_cycle_months], 10);
      if (!isNaN(parsedMonths) && parsedMonths > 0) {
        billingCycleMonths = parsedMonths;
        if (parsedMonths === 12) billingCycleText = '1 Year';
        else if (parsedMonths === 6) billingCycleText = '6 Months';
        else if (parsedMonths === 3) billingCycleText = '3 Months';
        else billingCycleText = `${parsedMonths} Month${parsedMonths > 1 ? 's' : ''}`;
      }
    }

    // Unique ID
    const explicitId = colMap.transaction_id !== undefined ? cols[colMap.transaction_id]?.trim() : '';
    const id = explicitId || `csv_tx_${i}_${Date.now()}`;

    // Additional metadata
    const status = colMap.status !== undefined && cols[colMap.status] ? cols[colMap.status].trim() : 'COMPLETED';
    const dataType = colMap.data_type !== undefined && cols[colMap.data_type] ? cols[colMap.data_type].trim() : 'CSV_UPLOAD';

    dates.push(parsedDate);

    transactions.push({
      id,
      date: parsedDate,
      rawNarration,
      description: rawNarration,
      cleanMerchant,
      merchant: cleanMerchant,
      category,
      suggestedCategory: category,
      amount,
      type,
      balance: balanceVal,
      balance_inr: balanceVal,
      payment_mode: paymentMode,
      paymentMode,
      recurring: isExplicitRecurring,
      isExplicitRecurring,
      billing_cycle_months: billingCycleMonths,
      billingCycle: billingCycleText,
      status,
      data_type: dataType,
      source: 'CSV_UPLOAD'
    });
  }

  if (transactions.length === 0) {
    throw new Error('No valid transactions found in the file. Please check column formats and non-zero amounts.');
  }

  // Calculate Date Range
  const sortedDates = [...dates].sort();
  const startDate = sortedDates[0];
  const endDate = sortedDates[sortedDates.length - 1];

  const formatDateLabel = (dStr) => {
    try {
      const d = new Date(dStr);
      return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return dStr;
    }
  };

  const dateRangeLabel = `${formatDateLabel(startDate)} – ${formatDateLabel(endDate)}`;

  const metadata = {
    fileName,
    totalRows: lines.length - 1,
    validCount: transactions.length,
    detectedColumns: detectedColumns.map(c => c.standard),
    detectedColumnDetails: detectedColumns,
    dateRange: {
      start: startDate,
      end: endDate,
      label: dateRangeLabel
    },
    totalDebit,
    totalCredit,
    latestBalance
  };

  // Attach metadata to the returned array for rich UI consumption
  transactions.metadata = metadata;

  return transactions;
}

/**
 * High-level wrapper that returns an explicit object { transactions, metadata }
 */
export function parseCSVWithMetadata(csvString, fileName = 'bank_statement.csv') {
  const transactions = parseCSVStatement(csvString, fileName);
  return {
    transactions,
    metadata: transactions.metadata
  };
}

/**
 * Cleanly splits a CSV line into columns, honoring single and double quotes.
 */
function splitCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  let quoteChar = '';

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if ((char === '"' || char === "'") && (!inQuotes || char === quoteChar)) {
      inQuotes = !inQuotes;
      quoteChar = inQuotes ? char : '';
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

/**
 * Parses numeric strings, stripping currency symbols, commas, and formatting spaces.
 */
function parseNumber(val) {
  if (!val) return 0;
  const cleaned = String(val).replace(/[^0-9.-]+/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

/**
 * Parses various date strings into standard YYYY-MM-DD.
 */
function parseDateString(dateStr) {
  if (!dateStr) return null;
  const clean = dateStr.trim();

  // 1. If already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) {
    return clean;
  }

  // 2. DD/MM/YYYY or DD-MM-YYYY
  const dmyMatch = clean.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (dmyMatch) {
    const day = dmyMatch[1].padStart(2, '0');
    const month = dmyMatch[2].padStart(2, '0');
    const year = dmyMatch[3];
    return `${year}-${month}-${day}`;
  }

  // 3. Fallback standard JavaScript Date parsing
  const d = new Date(clean);
  if (!isNaN(d.getTime())) {
    return d.toISOString().split('T')[0];
  }

  return null;
}

/**
 * Generates sample CSV bank statement string matching the exact target schema:
 * transaction_id, date, description, merchant, category, debit_inr, credit_inr, balance_inr, payment_mode, recurring, billing_cycle_months, status, data_type
 */
export function generateSampleCSVString(count = 200) {
  const headers = [
    'transaction_id',
    'date',
    'description',
    'merchant',
    'category',
    'debit_inr',
    'credit_inr',
    'balance_inr',
    'payment_mode',
    'recurring',
    'billing_cycle_months',
    'status',
    'data_type'
  ];

  const baseSubscriptions = [
    { merchant: 'Netflix', desc: 'UPI-NETFLIX-MUMBAI-AUTOPAY', cat: 'Entertainment', debit: 799, mode: 'UPI', recurring: 'true', cycle: 1, freqMonths: 1 },
    { merchant: 'Spotify', desc: 'NACH-SPOTIFY-INDIA-SERVICES', cat: 'Entertainment', debit: 119, mode: 'NACH', recurring: 'true', cycle: 1, freqMonths: 1 },
    { merchant: 'Canva', desc: 'CARD-CANVA-PTY-LTD-SYDNEY', cat: 'Productivity', debit: 499, mode: 'Card', recurring: 'true', cycle: 1, freqMonths: 1 },
    { merchant: 'Adobe Creative Cloud', desc: 'CARD-ADOBE-SYSTEMS-QUARTERLY', cat: 'Productivity', debit: 5499, mode: 'Card', recurring: 'true', cycle: 3, freqMonths: 3 },
    { merchant: 'HDFC Ergo Health Insurance', desc: 'ACH-HDFC-ERGO-HEALTH-INSURANCE', cat: 'Insurance', debit: 12000, mode: 'ACH', recurring: 'true', cycle: 6, freqMonths: 6 },
    { merchant: 'Amazon Prime', desc: 'AMZN-PRIME-ANNUAL-MEMBERSHIP', cat: 'Entertainment', debit: 1499, mode: 'Card', recurring: 'true', cycle: 12, freqMonths: 12 },
    { merchant: 'Airtel Broadband', desc: 'BBPS-BHARTI-AIRTEL-BROADBAND', cat: 'Bills & Utilities', debit: 899, mode: 'NetBanking', recurring: 'true', cycle: 1, freqMonths: 1 },
    { merchant: 'Google One 2TB', desc: 'GOOGLE-SERVICES-STORAGE-AUTOPAY', cat: 'Productivity', debit: 650, mode: 'Card', recurring: 'true', cycle: 1, freqMonths: 1 }
  ];

  const dailyMerchants = [
    { merchant: 'Swiggy', desc: 'UPI-SWIGGY-BANGALORE-ORDER', cat: 'Food & Dining', min: 220, max: 780, mode: 'UPI' },
    { merchant: 'Zomato', desc: 'UPI-ZOMATO-FOOD-DELIVERY', cat: 'Food & Dining', min: 180, max: 690, mode: 'UPI' },
    { merchant: 'Starbucks', desc: 'POS-STARBUCKS-BANDRA-MUMBAI', cat: 'Food & Dining', min: 280, max: 590, mode: 'Card' },
    { merchant: 'Blue Tokai Coffee', desc: 'UPI-BLUE-TOKAI-KORAMANGALA', cat: 'Food & Dining', min: 210, max: 480, mode: 'UPI' },
    { merchant: 'Uber', desc: 'UBER-INDIA-TRIP-RIDE-EXP', cat: 'Transportation', min: 160, max: 640, mode: 'UPI' },
    { merchant: 'Ola Cabs', desc: 'OLA-CABS-RIDE-DAILY-CITY', cat: 'Transportation', min: 140, max: 580, mode: 'UPI' },
    { merchant: 'Shell Petrol Station', desc: 'POS-SHELL-AUTO-FUEL-MUMBAI', cat: 'Transportation', min: 1200, max: 2800, mode: 'Card' },
    { merchant: 'Blinkit Instant Groceries', desc: 'BLINKIT-GROCERY-DELIVERY-EXP', cat: 'Groceries', min: 310, max: 1450, mode: 'UPI' },
    { merchant: 'Zepto Groceries', desc: 'ZEPTO-QUICK-DELIVERY-SERVICES', cat: 'Groceries', min: 280, max: 1120, mode: 'UPI' },
    { merchant: 'Amazon Shopping', desc: 'AMZN-RETAIL-INDIA-PURCHASE', cat: 'Shopping', min: 499, max: 3999, mode: 'Card' },
    { merchant: 'Nature Basket', desc: 'POS-NATURES-BASKET-PRODUCE', cat: 'Groceries', min: 850, max: 2400, mode: 'Card' },
    { merchant: 'Decathlon Sports', desc: 'DECATHLON-INDIA-SPORTING-GOODS', cat: 'Shopping', min: 699, max: 2899, mode: 'Card' },
    { merchant: 'BookMyShow', desc: 'BMS-ENTERTAINMENT-TICKETS-MUM', cat: 'Entertainment', min: 380, max: 980, mode: 'UPI' }
  ];

  const rows = [];
  let runningBalance = 84500;
  let txIndex = 1;

  const padId = (n) => `TXN_${String(n).padStart(4, '0')}`;

  // Start with predictable reference transactions for automated tests
  rows.push([padId(txIndex++), '2026-10-02', 'UPI-NETFLIX-MUMBAI-AUTOPAY', 'Netflix', 'Entertainment', '799', '0', '84500', 'UPI', 'true', '1', 'SUCCESS', 'PRODUCTION']);
  rows.push([padId(txIndex++), '2026-10-01', 'NACH-SPOTIFY-INDIA-SERVICES', 'Spotify', 'Entertainment', '119', '0', '85299', 'NACH', 'true', '1', 'SUCCESS', 'PRODUCTION']);
  rows.push([padId(txIndex++), '2026-09-28', 'CARD-CANVA-PTY-LTD-SYDNEY', 'Canva', 'Productivity', '499', '0', '85418', 'Card', 'true', '1', 'SUCCESS', 'PRODUCTION']);
  rows.push([padId(txIndex++), '2026-09-24', 'UPI-SWIGGY-BANGALORE-ORDER-298102', 'Swiggy', 'Food & Dining', '518', '0', '85917', 'UPI', 'false', '0', 'SUCCESS', 'PRODUCTION']);
  rows.push([padId(txIndex++), '2026-09-24', 'UPI-SWIGGY-BANGALORE-ORDER-298102', 'Swiggy', 'Food & Dining', '518', '0', '85399', 'UPI', 'false', '0', 'SUCCESS', 'PRODUCTION']); // Duplicate!
  rows.push([padId(txIndex++), '2026-09-20', 'BBPS-BHARTI-AIRTEL-BROADBAND', 'Airtel Broadband', 'Bills & Utilities', '899', '0', '85917', 'NetBanking', 'true', '1', 'SUCCESS', 'PRODUCTION']);
  rows.push([padId(txIndex++), '2026-09-15', 'CARD-ADOBE-SYSTEMS-QUARTERLY', 'Adobe Creative Cloud', 'Productivity', '5499', '0', '86816', 'Card', 'true', '3', 'SUCCESS', 'PRODUCTION']);
  rows.push([padId(txIndex++), '2026-09-10', 'ACH-HDFC-ERGO-HEALTH-INSURANCE', 'HDFC Ergo Health Insurance', 'Insurance', '12000', '0', '92315', 'ACH', 'true', '6', 'SUCCESS', 'PRODUCTION']);
  rows.push([padId(txIndex++), '2026-09-02', 'UPI-NETFLIX-MUMBAI-AUTOPAY', 'Netflix', 'Entertainment', '799', '0', '104315', 'UPI', 'true', '1', 'SUCCESS', 'PRODUCTION']);
  rows.push([padId(txIndex++), '2026-09-01', 'NEFT-SALARY-CREDIT-TECH-OPS', 'Salary Credit', 'Income', '0', '75000', '105114', 'NEFT', 'false', '0', 'SUCCESS', 'PRODUCTION']);
  rows.push([padId(txIndex++), '2026-09-25', 'POS-UNKNOWN-ELECTRONIC-MUMBAI', 'Unknown Merchant', 'Shopping', '18000', '0', '87114', 'Card', 'false', '0', 'SUCCESS', 'PRODUCTION']); // Unusual spike!
  rows.push([padId(txIndex++), '2026-04-18', 'AMZN-PRIME-ANNUAL-MEMBERSHIP', 'Amazon Prime', 'Entertainment', '1499', '0', '105114', 'Card', 'true', '12', 'SUCCESS', 'PRODUCTION']);

  // Add monthly recurring instances across previous months (April - October)
  const monthOffsets = ['2026-08', '2026-07', '2026-06', '2026-05', '2026-04'];
  for (const mPrefix of monthOffsets) {
    rows.push([padId(txIndex++), `${mPrefix}-01`, 'NEFT-SALARY-CREDIT-TECH-OPS', 'Salary Credit', 'Income', '0', '75000', String(runningBalance += 75000), 'NEFT', 'false', '0', 'SUCCESS', 'PRODUCTION']);
    rows.push([padId(txIndex++), `${mPrefix}-02`, 'UPI-NETFLIX-MUMBAI-AUTOPAY', 'Netflix', 'Entertainment', '699', '0', String(runningBalance -= 699), 'UPI', 'true', '1', 'SUCCESS', 'PRODUCTION']);
    rows.push([padId(txIndex++), `${mPrefix}-03`, 'NACH-SPOTIFY-INDIA-SERVICES', 'Spotify', 'Entertainment', '119', '0', String(runningBalance -= 119), 'NACH', 'true', '1', 'SUCCESS', 'PRODUCTION']);
    rows.push([padId(txIndex++), `${mPrefix}-20`, 'BBPS-BHARTI-AIRTEL-BROADBAND', 'Airtel Broadband', 'Bills & Utilities', '899', '0', String(runningBalance -= 899), 'NetBanking', 'true', '1', 'SUCCESS', 'PRODUCTION']);
  }

  // Add Adobe older cycle (Quarterly)
  rows.push([padId(txIndex++), '2026-06-15', 'CARD-ADOBE-SYSTEMS-QUARTERLY', 'Adobe Creative Cloud', 'Productivity', '4999', '0', String(runningBalance -= 4999), 'Card', 'true', '3', 'SUCCESS', 'PRODUCTION']);
  rows.push([padId(txIndex++), '2026-03-15', 'CARD-ADOBE-SYSTEMS-QUARTERLY', 'Adobe Creative Cloud', 'Productivity', '4999', '0', String(runningBalance -= 4999), 'Card', 'true', '3', 'SUCCESS', 'PRODUCTION']);

  // Add second duplicate pair for realistic anomaly review testing
  rows.push([padId(txIndex++), '2026-08-14', 'POS-STARBUCKS-BANDRA-MUMBAI', 'Starbucks', 'Food & Dining', '350', '0', String(runningBalance -= 350), 'Card', 'false', '0', 'SUCCESS', 'PRODUCTION']);
  rows.push([padId(txIndex++), '2026-08-14', 'POS-STARBUCKS-BANDRA-MUMBAI', 'Starbucks', 'Food & Dining', '350', '0', String(runningBalance -= 350), 'Card', 'false', '0', 'SUCCESS', 'PRODUCTION']);

  // Add Consulting / Freelance credit
  rows.push([padId(txIndex++), '2026-07-15', 'IMPS-FREELANCE-CONSULTING-CREDIT', 'Client Consulting', 'Income', '0', '25000', String(runningBalance += 25000), 'IMPS', 'false', '0', 'SUCCESS', 'PRODUCTION']);

  // Fill up the rest with realistic daily transactions to reach exactly count (default 200)
  let dayCounter = 0;
  const startEpoch = new Date('2026-04-01').getTime();
  const endEpoch = new Date('2026-10-05').getTime();
  const daySpan = (endEpoch - startEpoch) / (1000 * 60 * 60 * 24);

  while (rows.length < count) {
    const fraction = (dayCounter % daySpan) / daySpan;
    const dateEpoch = startEpoch + fraction * (endEpoch - startEpoch);
    const d = new Date(dateEpoch);
    const dateStr = d.toISOString().split('T')[0];

    const m = dailyMerchants[dayCounter % dailyMerchants.length];
    const amount = Math.floor(m.min + ((dayCounter * 37) % (m.max - m.min)));
    runningBalance -= amount;

    rows.push([
      padId(txIndex++),
      dateStr,
      `${m.desc}-${1000 + (dayCounter * 7) % 9000}`,
      m.merchant,
      m.cat,
      String(amount),
      '0',
      String(Math.max(12000, runningBalance)),
      m.mode,
      'false',
      '0',
      'SUCCESS',
      'PRODUCTION'
    ]);

    dayCounter++;
  }

  // Sort chronologically by date descending
  rows.sort((a, b) => b[1].localeCompare(a[1]));

  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}
