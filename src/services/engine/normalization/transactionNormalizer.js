/**
 * Canonical Transaction Normalizer
 * Converts raw mapped row data into the canonical Smart Expense transaction structure:
 * {
 *   id,
 *   user_id,
 *   date,
 *   original_description,
 *   merchant,
 *   amount,
 *   type,
 *   category,
 *   balance,
 *   account,
 *   source: "csv",
 *   is_reviewed,
 *   created_at
 * }
 */

import { mapRow } from './columnMapper.js';
import { normalizeDate } from './dateNormalizer.js';
import { normalizeAmountAndType, normalizeBalance } from './amountNormalizer.js';
import { normalizeMerchant } from './merchantNormalizer.js';
import { assignCategory } from './categoryEngine.js';
import { detectTransfer } from './transferDetection.js';
import { validateTransaction } from './transactionValidator.js';
import { generateFingerprint } from './duplicateDetector.js';

/**
 * Normalizes a single raw transaction row into the canonical format.
 *
 * @param {string[]|Object} rawRow Raw row array or object
 * @param {Object} mapping Column mapping dictionary
 * @param {Object} [options={}] Optional configuration (headers, index, account, userId)
 * @returns {Object} Canonical transaction object with validation and fingerprint attached
 */
export function normalizeTransactionRow(rawRow, mapping, options = {}) {
  const { headers = [], index = 0, account = null, userId = null, source = 'csv' } = options;

  // 1. Extract raw cell values using confirmed column mapping
  const mapped = mapRow(rawRow, mapping, headers);

  // 2. Original Description (PRESERVE EXACT UNTOUCHED BANK TEXT)
  const original_description = mapped.rawDescription || mapped.rawMerchant || '';

  // 3. Date Normalization (YYYY-MM-DD)
  const dateResult = normalizeDate(mapped.rawDate);
  const date = dateResult.date || mapped.rawDate || '';

  // 4. Amount and Type Normalization (positive amount, type: 'expense'|'income')
  const amountResult = normalizeAmountAndType({
    rawDebit: mapped.rawDebit,
    rawCredit: mapped.rawCredit,
    rawAmount: mapped.rawAmount,
    rawType: mapped.rawType
  });
  let amount = amountResult.amount;
  let type = amountResult.type;

  // 5. Merchant Normalization
  const merchantResult = normalizeMerchant(original_description, mapped.rawMerchant);
  const merchant = merchantResult.merchant;

  // 6. Category Assignment
  let category = assignCategory(merchant, original_description, {
    matchedEntry: merchantResult.matchedEntry,
    rawCategory: mapped.rawCategory,
    type
  });

  // 7. Internal / Peer Transfer Detection (Section 9)
  const transferCheck = detectTransfer(original_description, merchant);
  if (transferCheck.isTransfer) {
    type = 'transfer';
    category = 'Transfer';
  }

  // 8. Balance & Account
  const balance = normalizeBalance(mapped.rawBalance);
  const resolvedAccount = account || mapped.rawAccount || null;

  // 9. ID Generation
  const id = mapped.rawId || `tx_${date.replace(/-/g, '')}_${index + 1}_${Math.random().toString(36).substring(2, 8)}`;

  // Assemble Canonical Object
  const canonicalTx = {
    id,
    user_id: userId,
    date,
    original_description,
    merchant,
    amount,
    type, // 'income' | 'expense' | 'transfer'
    category,
    balance,
    account: resolvedAccount,
    source,
    is_reviewed: false,
    created_at: new Date().toISOString(),

    // Backwards compatibility properties:
    cleanMerchant: merchant,
    description: original_description,
    rawNarration: original_description,
    raw: original_description,
    debit: type === 'expense' ? amount : 0,
    credit: type === 'income' ? amount : 0,
    balance_inr: balance,
    paymentMode: mapped.rawType || 'Electronic',
    payment_mode: mapped.rawType || 'Electronic'
  };

  // 10. Validation Check
  const validation = validateTransaction(canonicalTx);
  canonicalTx.is_valid = validation.isValid;
  canonicalTx.needs_review = validation.needs_review;
  canonicalTx.is_reviewed = validation.isValid; // If valid, considered reviewed
  canonicalTx.validation_errors = validation.errors;

  if (!dateResult.isValid && dateResult.error) {
    canonicalTx.validation_errors.push(dateResult.error);
    canonicalTx.is_valid = false;
    canonicalTx.needs_review = true;
  }
  if (!amountResult.isValid && amountResult.error) {
    canonicalTx.validation_errors.push(amountResult.error);
    canonicalTx.is_valid = false;
    canonicalTx.needs_review = true;
  }

  // 11. Deterministic Fingerprint
  canonicalTx.fingerprint = generateFingerprint(canonicalTx);

  return canonicalTx;
}
