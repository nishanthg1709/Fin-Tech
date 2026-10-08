/**
 * Transaction Validation Engine
 * Validates canonical transaction properties and identifies records that require review.
 */

/**
 * Validates a normalized transaction against core integrity constraints.
 *
 * @param {Object} tx Canonical transaction object
 * @returns {{
 *   isValid: boolean,
 *   needs_review: boolean,
 *   errors: string[]
 * }}
 */
export function validateTransaction(tx) {
  const errors = [];

  // 1. Validate Date: exists, non-empty, matches YYYY-MM-DD
  if (!tx.date || typeof tx.date !== 'string') {
    errors.push('Missing transaction date');
  } else if (!/^\d{4}-\d{2}-\d{2}$/.test(tx.date)) {
    errors.push(`Invalid date format (${tx.date}), expected YYYY-MM-DD`);
  }

  // 2. Validate Original Description: exists, non-empty string
  if (!tx.original_description || typeof tx.original_description !== 'string' || tx.original_description.trim() === '') {
    errors.push('Missing transaction description');
  }

  // 3. Validate Amount: positive numeric value >= 0, not NaN
  if (tx.amount === null || tx.amount === undefined || typeof tx.amount !== 'number' || isNaN(tx.amount)) {
    errors.push('Invalid numeric amount');
  } else if (tx.amount < 0) {
    errors.push('Amount cannot be negative in canonical format');
  }

  // 4. Validate Type: must be "income", "expense", or "transfer"
  const validTypes = ['income', 'expense', 'transfer'];
  if (!tx.type || !validTypes.includes(tx.type)) {
    errors.push(`Invalid transaction type: "${tx.type}". Expected "income", "expense", or "transfer"`);
  }

  // 5. Validate Category: must exist and be non-empty
  if (!tx.category || typeof tx.category !== 'string' || tx.category.trim() === '') {
    errors.push('Missing transaction category');
  }

  const isValid = errors.length === 0;

  return {
    isValid,
    needs_review: !isValid,
    errors
  };
}
