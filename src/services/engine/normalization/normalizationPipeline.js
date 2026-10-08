/**
 * Complete Transaction Normalization Pipeline
 * Orchestrates CSV parsing, column detection, column mapping, row normalization,
 * merchant cleansing, categorization, validation, and duplicate detection.
 */

import { parseCSVRaw } from './csvParser.js';
import { detectColumns } from './columnDetector.js';
import { normalizeTransactionRow } from './transactionNormalizer.js';
import { detectDuplicates } from './duplicateDetector.js';

/**
 * Step 1: Analyzes CSV structure and returns column detection findings.
 * Used by UI to decide whether to auto-proceed or show column mapping screen.
 *
 * @param {string} csvText
 * @param {string} [fileName='statement.csv']
 * @returns {Object}
 */
export function analyzeCSVStructure(csvText, fileName = 'statement.csv') {
  const parsed = parseCSVRaw(csvText);
  const sampleRows = parsed.rows.slice(0, 5);
  const detection = detectColumns(parsed.headers, sampleRows);

  return {
    headers: parsed.headers,
    sampleRows,
    totalRows: parsed.rows.length,
    delimiter: parsed.delimiter,
    fileName,
    mapping: detection.mapping,
    detectedColumns: detection.detectedColumns,
    unmappedHeaders: detection.unmappedHeaders,
    isConfident: detection.isConfident,
    detectedBank: detection.detectedBank,
    missingRequired: detection.missingRequired
  };
}

/**
 * Step 2: Executes full normalization pipeline.
 *
 * @param {string} csvText
 * @param {string} [fileName='statement.csv']
 * @param {Object} [customMapping=null] User-confirmed or customized column mapping
 * @param {Array} [existingTransactions=[]] Existing stored transactions for deduplication
 * @param {Object} [options={}] Additional options (userId, accountName)
 * @returns {Object} Pipeline result ready for preview and persistence
 */
export function executeNormalizationPipeline(
  csvText,
  fileName = 'statement.csv',
  customMapping = null,
  existingTransactions = [],
  options = {}
) {
  const parsed = parseCSVRaw(csvText);
  const sampleRows = parsed.rows.slice(0, 5);

  // Use custom mapping if provided, otherwise detect automatically
  let mapping = customMapping;
  let detection = null;
  if (!mapping) {
    detection = detectColumns(parsed.headers, sampleRows);
    mapping = detection.mapping;
  }

  // Ensure required fields exist in mapping
  if (mapping.date === undefined) {
    throw new Error("We couldn't analyze this file. Missing required column: date.");
  }
  if (mapping.debit === undefined && mapping.credit === undefined && mapping.amount === undefined) {
    throw new Error("We couldn't analyze this file. Missing required amount column: debit_inr, credit_inr, or amount.");
  }

  // Normalize each row
  const normalizedRows = [];
  const invalidRows = [];
  let totalDebit = 0;
  let totalCredit = 0;
  let latestBalance = null;
  const validDates = [];

  for (let idx = 0; idx < parsed.rows.length; idx++) {
    const rawRow = parsed.rows[idx];
    const canonicalTx = normalizeTransactionRow(rawRow, mapping, {
      headers: parsed.headers,
      index: idx,
      account: options.account || (detection?.detectedBank || fileName),
      userId: options.userId || null,
      source: 'csv'
    });

    if (canonicalTx.balance !== null && canonicalTx.balance !== undefined) {
      latestBalance = canonicalTx.balance;
    }

    if (canonicalTx.is_valid) {
      if (canonicalTx.type === 'expense') totalDebit += canonicalTx.amount;
      if (canonicalTx.type === 'income') totalCredit += canonicalTx.amount;
      if (canonicalTx.date) validDates.push(canonicalTx.date);
    } else {
      invalidRows.push(canonicalTx);
    }

    normalizedRows.push(canonicalTx);
  }

  // Deduplicate against existing transactions and intra-batch
  const deduplication = detectDuplicates(normalizedRows, existingTransactions);

  const readyTransactions = deduplication.uniqueTransactions.filter(t => t.is_valid);
  const needsReviewTransactions = normalizedRows.filter(t => t.needs_review);
  const duplicateTransactions = deduplication.duplicateTransactions;

  // Compute date range
  const sortedDates = [...validDates].sort();
  const startDate = sortedDates[0] || '';
  const endDate = sortedDates[sortedDates.length - 1] || '';

  const formatDateLabel = (dStr) => {
    if (!dStr) return '';
    try {
      const d = new Date(dStr);
      return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return dStr;
    }
  };

  const dateRangeLabel = startDate && endDate
    ? `${formatDateLabel(startDate)} – ${formatDateLabel(endDate)}`
    : '';

  const metadata = {
    fileName,
    totalRows: parsed.rows.length,
    validCount: readyTransactions.length,
    readyCount: readyTransactions.length,
    needsReviewCount: needsReviewTransactions.length,
    duplicateCount: duplicateTransactions.length,
    invalidCount: invalidRows.length,
    detectedColumns: Object.keys(mapping),
    detectedBank: detection?.detectedBank || null,
    mapping,
    dateRange: {
      start: startDate,
      end: endDate,
      label: dateRangeLabel
    },
    totalDebit,
    totalCredit,
    latestBalance
  };

  // Attach metadata to the ready transactions array for full backward compatibility
  readyTransactions.metadata = metadata;

  return {
    transactions: readyTransactions,
    allNormalized: normalizedRows,
    readyTransactions,
    needsReviewTransactions,
    duplicateTransactions,
    metadata,
    stats: {
      totalRows: parsed.rows.length,
      readyCount: readyTransactions.length,
      needsReviewCount: needsReviewTransactions.length,
      duplicateCount: duplicateTransactions.length
    }
  };
}
