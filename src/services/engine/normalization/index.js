/**
 * Transaction Normalization Engine Index
 * Exports all decoupled normalization services.
 */

export { parseCSVRaw, splitCSVLine, detectDelimiter } from './csvParser.js';
export { detectColumns, normalizeHeader, CANONICAL_FIELD_ALIASES } from './columnDetector.js';
export { mapRow } from './columnMapper.js';
export { normalizeDate, isValidCalendarDate } from './dateNormalizer.js';
export { normalizeAmountAndType, normalizeBalance, parseCleanNumber } from './amountNormalizer.js';
export { normalizeMerchant, MERCHANT_DICTIONARY } from './merchantNormalizer.js';
export { assignCategory, CANONICAL_CATEGORIES } from './categoryEngine.js';
export { detectTransfer } from './transferDetection.js';
export { validateTransaction } from './transactionValidator.js';
export { generateFingerprint, detectDuplicates } from './duplicateDetector.js';
export { normalizeTransactionRow } from './transactionNormalizer.js';
export { analyzeCSVStructure, executeNormalizationPipeline } from './normalizationPipeline.js';
