/**
 * Amount and Transaction Type Normalization Engine
 * Converts statement amounts into positive numeric values with canonical
 * type: "expense" | "income".
 */

/**
 * Strips currency symbols (₹, Rs, INR, $, etc.), commas, and whitespace,
 * returning a clean numeric float.
 * @param {string|number} val
 * @returns {number|null}
 */
export function parseCleanNumber(val) {
  if (val === null || val === undefined) return null;
  if (typeof val === 'number') {
    return isNaN(val) ? null : val;
  }

  let str = String(val).trim();
  if (str === '' || str === '-' || str === '--') return null;

  // Handle accounting parentheses: e.g. "(1,499.00)" -> -1499.00
  let isNegative = false;
  if (str.startsWith('(') && str.endsWith(')')) {
    isNegative = true;
    str = str.slice(1, -1);
  }

  // Handle minus sign
  if (str.startsWith('-') || str.endsWith('-')) {
    isNegative = true;
    str = str.replace(/-/g, '');
  }

  // Strip non-numeric chars except period and comma
  // Remove currency words / symbols like INR, Rs, ₹, USD, etc.
  str = str.replace(/[^0-9.,]/g, '');

  // Strip comma thousand separators
  str = str.replace(/,/g, '');

  const num = parseFloat(str);
  if (isNaN(num)) return null;

  return isNegative ? -Math.abs(num) : num;
}

/**
 * Normalizes amount and type from mapped raw fields.
 * Supports:
 * 1. Explicit Debit and Credit columns.
 * 2. Amount column + Dr/Cr or Type column.
 * 3. Signed Amount column (+ income, - expense).
 *
 * @param {{
 *   rawDebit?: string|number,
 *   rawCredit?: string|number,
 *   rawAmount?: string|number,
 *   rawType?: string
 * }} fields
 * @returns {{
 *   amount: number,
 *   type: 'expense'|'income',
 *   isValid: boolean,
 *   error?: string
 * }}
 */
export function normalizeAmountAndType(fields = {}) {
  const { rawDebit, rawCredit, rawAmount, rawType } = fields;

  const debitVal = parseCleanNumber(rawDebit);
  const creditVal = parseCleanNumber(rawCredit);
  const amountVal = parseCleanNumber(rawAmount);

  // Scenario 1: Distinct Debit and Credit columns
  if (debitVal !== null && debitVal > 0 && (creditVal === null || creditVal === 0)) {
    return {
      amount: debitVal,
      type: 'expense',
      isValid: true
    };
  }

  if (creditVal !== null && creditVal > 0 && (debitVal === null || debitVal === 0)) {
    return {
      amount: creditVal,
      type: 'income',
      isValid: true
    };
  }

  // Scenario 2: Amount with explicit Dr/Cr or Type column
  if (amountVal !== null && amountVal !== 0) {
    const absAmount = Math.abs(amountVal);
    const typeIndicator = String(rawType || '').trim().toUpperCase();

    // Check type column indicators
    const isDr = typeIndicator === 'DR' ||
                 typeIndicator === 'DEBIT' ||
                 typeIndicator === 'WITHDRAWAL' ||
                 typeIndicator === 'EXPENSE' ||
                 typeIndicator.startsWith('DR');

    const isCr = typeIndicator === 'CR' ||
                 typeIndicator === 'CREDIT' ||
                 typeIndicator === 'DEPOSIT' ||
                 typeIndicator === 'INCOME' ||
                 typeIndicator.startsWith('CR');

    if (isDr) {
      return {
        amount: absAmount,
        type: 'expense',
        isValid: true
      };
    }

    if (isCr) {
      return {
        amount: absAmount,
        type: 'income',
        isValid: true
      };
    }

    // Scenario 3: Signed amount without type column
    if (amountVal < 0) {
      return {
        amount: absAmount,
        type: 'expense',
        isValid: true
      };
    }

    // If amount is positive and debit column had a match or default is expense
    return {
      amount: absAmount,
      type: 'income', // Positive without debit indicator
      isValid: true
    };
  }

  // Both debit & credit present or both zero
  if (debitVal !== null && debitVal > 0 && creditVal !== null && creditVal > 0) {
    return {
      amount: debitVal,
      type: 'expense',
      isValid: false,
      error: 'Both debit and credit amounts found on the same row'
    };
  }

  return {
    amount: 0,
    type: 'expense',
    isValid: false,
    error: 'Amount is zero, missing, or invalid'
  };
}

/**
 * Normalizes balance field value.
 * @param {string|number} rawBalance
 * @returns {number|null}
 */
export function normalizeBalance(rawBalance) {
  return parseCleanNumber(rawBalance);
}
